import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, InteractionReplyOptions, GuildMember, StringSelectMenuBuilder, SelectMenuComponentOptionData, ButtonInteraction } from "discord.js";
import { Command } from "../InteractionInterface";
import { failedToCreateGameError, generalError, noGuildError, noQuotesError } from "../InteractionReplies";
import { isGuildCommand } from "../Essentials";
import quoteSchema from "../models/quoteSchema";
import quoteGuesserSchema from "../models/quoteGuesserSchema";
import guildMemberSchema from "../models/guildMemberSchema";
import settings from "../settings.json";
import { debug } from "../Log";

export const QuoteGuesser: Command = {
    name: "quote-guesser",
    description: "Play a game of quoteguesser with your friends",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "play",
            description: "Start a game of quote guesser"
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "leaderboard",
            description: "View the leaderboard for quote guesser"
        }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        debug("Quote guesser command called");

        if (!interaction.isChatInputCommand()) {
            await interaction.reply(generalError);
            return;
        }
        if (!isGuildCommand(interaction)) {
            await interaction.reply(noGuildError);
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        let reply: InteractionReplyOptions;
        switch (subcommand) {
            case "play":
                reply = await handlePlay(interaction);
                break;
            case "leaderboard":
                reply = await handleLeaderboard(interaction);
                break;
            default:
                reply = generalError;
                break;
        }

        await interaction.reply(reply);
    }
}

// Subcommand handlers
/**
 * Create a new game of quote guesser
 * @param interaction
 */
const handlePlay = async (interaction: ChatInputCommandInteraction): Promise<InteractionReplyOptions> => {
    debug("Play quoteguesser subcommand called");

    if (!isGuildCommand(interaction)) {
        return noGuildError;
    }

    const token = await newToken();
    if (token === undefined) {
        return failedToCreateGameError;
    }

    return await newGame(interaction, token, 1);
}

/**
 * Display the leaderboard for quote guesser
 * @param interaction
 */
const handleLeaderboard = async (interaction: ChatInputCommandInteraction): Promise<InteractionReplyOptions> => {
    debug("Quote guesser leaderboard subcommand called")

    if (!isGuildCommand(interaction)) {
        return noGuildError;
    }

    const guildMembers = await guildMemberSchema.find({ guildId: interaction.guildId });

    const ranking = guildMembers.sort((a, b) => (b.quoteGuesserScore || 0) - (a.quoteGuesserScore || 0)).slice(0, 10);

    const embed = new EmbedBuilder()
        .setTitle("Quote Guesser Leaderboard")
        .setDescription(ranking.map((member, index) => `${index + 1}. ${member.displayName ?? member.username} - ${member.quoteGuesserScore ?? 0}`).join("\n"));

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
export const newGame = async (interaction: ChatInputCommandInteraction | ButtonInteraction, token: string, round: number): Promise<InteractionReplyOptions> => {
    debug(`Creating new game of quote guesser with token ${token} and round ${round}`);
    
    // Gets a random quote from the database
    const quote = await quoteSchema.randomQuote(interaction.guildId!);

    // If there are no quotes, return an error
    if (quote === undefined) {
        return noQuotesError;
    }
    
    // Create a new quote guesser document in the database
    const document = await quoteGuesserSchema.create({
        guildId: interaction.guildId,
        token: token,
        quote: quote.quote,
        authorId: quote.author?.userId,
        authorName: await quote.authorName,
        authorAlias: quote.author?.username,
        round: round
    })

    // Create the game embed
    const embed = new EmbedBuilder()
        .setTitle("Who said this quote?")
        .setDescription(`"${quote.quote}" - ???`)
        .setFooter({ text: "No one answered yet" })
        .setAuthor({ name: `Round ${round}` });

    // Create the selection menu
    const selectionMenu = new StringSelectMenuBuilder()
        .setCustomId(`answerQuoteGuesser:${token}`)
        .setPlaceholder("Select your guess")

    // Create the buttons
    const nextButton = new ButtonBuilder()
        .setCustomId(`nextQuoteGuesser:${token}`)
        .setLabel("Next Round")
        .setStyle(ButtonStyle.Primary);

    const stopButton = new ButtonBuilder()
        .setCustomId(`stopQuoteGuesser:${token}`)
        .setLabel("Stop")
        .setStyle(ButtonStyle.Danger);

    // Add the authors to the selection menu
    const allAuthors = await quoteSchema.allAuthors(interaction.guildId!);
    for (const author of allAuthors) {
        selectionMenu.addOptions({
            label: author.name ?? "Unknown",
            value: author.id ?? author.name
        } as SelectMenuComponentOptionData);
    }

    // Create the component rows
    const buttonRow = new ActionRowBuilder()
        .addComponents(nextButton, stopButton);
    const selectionRow = new ActionRowBuilder()
        .addComponents(selectionMenu);

    // Return the game message
    return { 
        embeds: [embed], 
        components: [buttonRow, selectionRow] 
    } as InteractionReplyOptions;
}

/**
 * Generate a new token for a game
 * @returns The new token or undefined if no token could be generated
 */
const newToken = async (): Promise<string | undefined> => {
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
    } while (await quoteGuesserSchema.exists({ token: token }) && i < settings.maxTokenAttempts);

    if (i >= settings.maxTokenAttempts) {
        return undefined;
    }
    return token;
}
