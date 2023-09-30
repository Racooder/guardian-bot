import {
    CommandInteraction,
    Client,
    ApplicationCommandType,
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    InteractionReplyOptions,
    StringSelectMenuBuilder,
    SelectMenuComponentOptionData,
    ButtonInteraction,
} from "discord.js";
import { Command } from "../InteractionInterfaces";
import {
    failedToCreateGameError,
    generalError,
    noGuildError,
    noQuotesError,
} from "../InteractionReplies";
import { handleSubcommands, isGuildCommand } from "../Essentials";
import quoteSchema from "../models/quoteSchema";
import quoteGuesserSchema from "../models/quoteGuesserSchema";
import guildMemberSchema from "../models/guildMemberSchema";
import settings from "../settings.json";
import { debug, error } from "../Log";
import { StatisticType } from "../models/statisticsSchema";

export const QuoteGuesser: Command = {
    name: "quote-guesser",
    description: "Play a game of quoteguesser with your friends",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "play",
            description: "Start a game of quote guesser",
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "leaderboard",
            description: "View the leaderboard for quote guesser",
        },
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        debug("Quote guesser command called");

        if (!interaction.isChatInputCommand()) {
            error("QuoteGuesser command was not a chat input command", client);
            await interaction.reply(generalError);
            return;
        }
        if (!isGuildCommand(interaction)) {
            debug("QuoteGuesser command was not a guild command"); // This happens when the command is run in a DM
            await interaction.reply(noGuildError);
            return;
        }

        await handleSubcommands(
            interaction,
            interaction.options.getSubcommand(),
            [
                {
                    key: "play",
                    run: handlePlay,
                    stats: [StatisticType.Command_QuoteGuesser_Play],
                },
                {
                    key: "leaderboard",
                    run: handleLeaderboard,
                    stats: [StatisticType.Command_QuoteGuesser_Leaderboard],
                },
            ],
            [StatisticType.Command_QuoteGuesser]
        );
    },
};

// Subcommand handlers
/**
 * Create a new game of quote guesser
 * @param interaction
 */
async function handlePlay(
    interaction: ChatInputCommandInteraction
): Promise<InteractionReplyOptions> {
    debug("Play quoteguesser subcommand called");

    const token = await newToken();
    if (token === undefined) {
        debug("Failed to generate token");
        return failedToCreateGameError;
    }

    return await newGame(interaction, token, 1);
}

/**
 * Display the leaderboard for quote guesser
 * @param interaction
 */
async function handleLeaderboard(
    interaction: ChatInputCommandInteraction
): Promise<InteractionReplyOptions> {
    debug("Quote guesser leaderboard subcommand called");

    const guildMembers = await guildMemberSchema.find({
        guildId: interaction.guildId,
    });

    const ranking = guildMembers
        .sort((a, b) => (b.quoteGuesserScore || 0) - (a.quoteGuesserScore || 0))
        .slice(0, 10);

    const embed = new EmbedBuilder()
        .setTitle("Quote Guesser Leaderboard")
        .setDescription(
            ranking
                .map(
                    (member, index) =>
                        `${index + 1}. ${
                            member.displayName ?? member.username
                        } - ${member.quoteGuesserScore ?? 0}`
                )
                .join("\n")
        );

    return { embeds: [embed] };
}

// Game management
/**
 * Create a new game of quote guesser
 * @param interaction - The interaction that started the game
 * @param token - The token for the game
 * @param round - The round number
 * @returns The game message
 */
export async function newGame(
    interaction: ChatInputCommandInteraction | ButtonInteraction,
    token: string,
    round: number
): Promise<InteractionReplyOptions> {
    debug(
        `Creating new game of quote guesser with token ${token} and round ${round}`
    );

    debug("Getting a random quote");
    const quote = await quoteSchema.randomQuote(interaction.guildId!);

    if (quote === undefined) {
        debug("No quotes found");
        return noQuotesError;
    }

    debug("Creating new game document");
    await quoteGuesserSchema.create({
        guildId: interaction.guildId,
        token: token,
        quote: quote.quote,
        authorId: quote.author?.userId,
        authorName: await quote.authorName,
        authorAlias: quote.author?.username,
        round: round,
    });

    debug("Creating message embed and components");
    const embed = new EmbedBuilder()
        .setTitle("Who said this quote?")
        .setDescription(`"${quote.quote}" - ???`)
        .setFooter({ text: "No one answered yet" })
        .setAuthor({ name: `Round ${round}` });
    const selectionMenu = new StringSelectMenuBuilder()
        .setCustomId(`answerQuoteGuesser:${token}`)
        .setPlaceholder("Select your guess");
    const nextButton = new ButtonBuilder()
        .setCustomId(`nextQuoteGuesser:${token}`)
        .setLabel("Next Round")
        .setStyle(ButtonStyle.Primary);
    const stopButton = new ButtonBuilder()
        .setCustomId(`stopQuoteGuesser:${token}`)
        .setLabel("Stop")
        .setStyle(ButtonStyle.Danger);

    debug("Adding authors to selection menu");
    const allAuthors = await quoteSchema.allAuthors(interaction.guildId!);
    for (const author of allAuthors) {
        selectionMenu.addOptions({
            label: author.name ?? "Unknown",
            value: author.id ?? author.name,
        } as SelectMenuComponentOptionData);
    }

    debug("Adding components to message");
    const buttonRow = new ActionRowBuilder().addComponents(
        nextButton,
        stopButton
    );
    const selectionRow = new ActionRowBuilder().addComponents(selectionMenu);

    return {
        embeds: [embed],
        components: [buttonRow, selectionRow],
    } as InteractionReplyOptions;
}

/**
 * Generate a new token for a game
 * @returns The new token or undefined if no token could be generated
 */
async function newToken(): Promise<string | undefined> {
    debug("Generating new token for quote guesser");

    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    const length = characters.length;

    // Generate a new token
    let token = "";
    let i = 0;
    do {
        token = "";
        for (let i = 0; i < 6; i++) {
            token += characters.charAt(Math.floor(Math.random() * length));
        }
        i++;
    } while (
        (await quoteGuesserSchema.exists({ token: token })) &&
        i < settings.maxTokenAttempts
    );

    if (i >= settings.maxTokenAttempts) {
        return undefined;
    }
    return token;
}
