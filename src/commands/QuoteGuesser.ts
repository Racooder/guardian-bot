import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, InteractionReplyOptions, GuildMember, StringSelectMenuBuilder, SelectMenuComponentOptionData, ButtonInteraction } from "discord.js";
import { Command } from "../InteractionInterface";
import { generalError, noGuildError } from "../InteractionReplies";
import { isGuildCommand } from "../Essentials";
import quoteSchema from "../models/quoteSchema";
import quoteGuesserSchema from "../models/quoteGuesserSchema";
import guildMemberSchema from "../models/guildMemberSchema";
import settings from "../settings.json";
import { findCurrentRound } from '../models/quoteGuesserSchema';

export const QuoteGuesser: Command = {
    name: "quote-guesser",
    description: "Play different games with your friends",
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
        if (!interaction.isChatInputCommand()) {
            await interaction.reply(generalError);
            return;
        }
        if (!isGuildCommand(interaction)) {
            await interaction.reply(noGuildError);
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "play":
                handlePlay(interaction);
                break;
            case "leaderboard":
                handleLeaderboard(interaction);
                break;
        }
    }
}

const handlePlay = async (interaction: ChatInputCommandInteraction) => {
    if (!isGuildCommand(interaction)) {
        await interaction.reply(noGuildError);
        return;
    }

    const token = await newToken();
    if (token === undefined) {
        await interaction.reply({ content: "Failed to create a new game", ephemeral: true });
        return;
    }

    const reply = await newGame(interaction, token, 1);

    await interaction.reply(reply);
}

const handleLeaderboard = async (interaction: ChatInputCommandInteraction) => {
    if (!isGuildCommand(interaction)) {
        await interaction.reply(noGuildError);
        return;
    }

    const guildMembers = await guildMemberSchema.find({ guildId: interaction.guildId });

    const ranking = guildMembers.sort((a, b) => (b.quoteGuesserScore || 0) - (a.quoteGuesserScore || 0)).slice(0, 10);

    const embed = new EmbedBuilder()
        .setTitle("Quote Guesser Leaderboard")
        .setDescription(ranking.map((member, index) => `${index + 1}. ${member.displayName ?? member.username} - ${member.quoteGuesserScore ?? 0}`).join("\n"));

    await interaction.reply({ embeds: [embed] });
}

export const newGame = async (interaction: ChatInputCommandInteraction | ButtonInteraction, token: string, round: number): Promise<InteractionReplyOptions> => {
    const quote = await quoteSchema.randomQuote(interaction.guildId!);

    if (quote === undefined) {
        return { content: "There are no quotes on this server", ephemeral: true }
    }
    
    const document = await quoteGuesserSchema.create({
        guildId: interaction.guildId,
        token: token,
        quote: quote.quote,
        authorId: quote.author?.userId,
        authorName: await quote.authorName,
        authorAlias: quote.author?.username,
        round: round
    })

    const embed = new EmbedBuilder()
        .setTitle("Who said this quote?")
        .setDescription(`"${quote.quote}" - Unknown`)
        .setFooter({ text: "No one answered yet" })
        .setAuthor({ name: `Round ${round}` });

    const selectionMenu = new StringSelectMenuBuilder()
        .setCustomId(`answerQuoteGuesser:${token}`)
        .setPlaceholder("Select your guess")

    const nextButton = new ButtonBuilder()
        .setCustomId(`nextQuoteGuesser:${token}`)
        .setLabel("Next Round")
        .setStyle(ButtonStyle.Primary);

    const stopButton = new ButtonBuilder()
        .setCustomId(`stopQuoteGuesser:${token}`)
        .setLabel("Stop")
        .setStyle(ButtonStyle.Danger);

    const allAuthors = await quoteSchema.allAuthors(interaction.guildId!);
    for (const author of allAuthors) {
        selectionMenu.addOptions({
            label: author.name ?? "Unknown",
            value: author.id ?? author.name
        } as SelectMenuComponentOptionData);
    }

    const buttonRow = new ActionRowBuilder()
        .addComponents(nextButton, stopButton);
    const selectionRow = new ActionRowBuilder()
        .addComponents(selectionMenu);

    return { 
        embeds: [embed], 
        components: [buttonRow, selectionRow] 
    } as InteractionReplyOptions;
}

const newToken = async (): Promise<string | undefined> => {
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    const length = characters.length;

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
