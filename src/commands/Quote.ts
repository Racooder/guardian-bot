import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType, ChatInputCommandInteraction, GuildMember, ButtonStyle, InteractionReplyOptions } from "discord.js";
import { Command } from "../InteractionInterface";
import quoteSchema, { IQuote } from "../models/quoteSchema";
import guildMemberSchema, { IGuildMember } from "../models/guildMemberSchema";
import quoteListSchema from "../models/quoteListSchema";
import { isGuildCommand } from "../Essentials";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";

export const Quote: Command = {
    name: "quote",
    description: "Create, view, edit and delete quotes",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "new",
            description: "Create a new quote",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "quote",
                    description: "The quote",
                    required: true
                },
                {
                    type: ApplicationCommandOptionType.User,
                    name: "author",
                    description: "The author of the quote"
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "non-discord-author",
                    description: "The author of the quote if they are not a discord user"
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "list",
            description: "List all quotes",
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "search",
            description: "Search for a quote",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "content",
                    description: "The content to search for"
                },
                {
                    type: ApplicationCommandOptionType.User,
                    name: "author",
                    description: "The author of the quote"
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "author-name",
                    description: "The author of the quote if they are not a discord user or left the server"
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "date",
                    description: "The approximate date the quote was created"
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "edit",
            description: "Edit or delete your quotes"
        }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) {
            await interaction.reply({ content: "An error has occurred" });
            return;
        };
        if (!isGuildCommand(interaction)) {
            await noGuildError(interaction);
            return;
        }

        const subCommand = interaction.options.getSubcommand();
        if (subCommand === "new") {
            await handleNewQuote(client, interaction);
        } else if (subCommand === "list") {
            await handleListQuotes(client, interaction);
        } else if (subCommand === "search") {
            await handleSearchQuotes(client, interaction);
        } else if (subCommand === "edit") {
            await handleEditQuote(client, interaction);
        }
    }
};

// Subcommand handlers
const handleNewQuote = async (client: Client, interaction: ChatInputCommandInteraction): Promise<void> => {
    if (!isGuildCommand(interaction)) {
        await noGuildError(interaction);
        return;
    }

    const quote = interaction.options.getString("quote", true);
    const author = interaction.options.getUser("author");
    const nonDiscordAuthor = interaction.options.getString("non-discord-author");

    if (author === null && nonDiscordAuthor === null) {
        await interaction.reply({
            content: "You must specify a author or non-discord author!",
            ephemeral: true
        });
        return;
    }

    const creatorMember = interaction.member as GuildMember;

    const creatorDocument = await guildMemberSchema.updateNames(interaction.guildId!, interaction.user.id, interaction.user.username, creatorMember.displayName, interaction.user.discriminator);
    let authorDocument: IGuildMember | null = null;
    if (author !== null) {
        authorDocument = await guildMemberSchema.updateNames(interaction.guildId!, author.id, author.username, (await interaction.guild!.members.fetch(author.id)).displayName, author.discriminator);
    }

    const quoteDocument = await quoteSchema.create({
        guildId: interaction.guildId!,
        quote: quote,
        timestamp: Math.round(Date.now() / 1000),
        author: authorDocument?._id,
        nonDiscordAuthor: nonDiscordAuthor,
        creator: creatorDocument._id
    });

    const messageEmbed = new EmbedBuilder()
        .setTitle(`"${quoteDocument.quote}" - ${authorDocument?._id ? `${authorDocument.displayName}#${authorDocument.discriminator}` : quoteDocument.nonDiscordAuthor}`)
        .setTimestamp(quoteDocument.timestamp)
        .setAuthor({
            name: creatorMember.displayName,
            iconURL: interaction.user.displayAvatarURL()
        })
        .setColor(parseInt("4DA4AD", 16))

    await interaction.reply({
        embeds: [messageEmbed]
    });
};

const handleListQuotes = async (client: Client, interaction: ChatInputCommandInteraction): Promise<void> => {
    if (!isGuildCommand(interaction)) {
        await noGuildError(interaction);
        return;
    }

    const quoteChunks = await quoteSchema.listQuotes(interaction.guildId!, 2);
    
    const quoteListDocument = await quoteListSchema.create({
        page: 0,
    })

    const messageEmbed = quoteListEmbed(quoteChunks, quoteListDocument.page);
    
    const previousPageButton = new ButtonBuilder()
        .setCustomId(`quotePage;previous;${quoteListDocument._id}`)
        .setLabel("Previous Page")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const nextPageButton = new ButtonBuilder()
        .setCustomId(`quotePage;next;${quoteListDocument._id}`)
        .setLabel("Next Page")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(quoteChunks.length === 1);

    const row = new ActionRowBuilder()
        .addComponents(previousPageButton, nextPageButton);

    await interaction.reply({
        embeds: [messageEmbed],
        components: [row]
    } as InteractionReplyOptions);
};

const handleSearchQuotes = async (client: Client, interaction: ChatInputCommandInteraction): Promise<void> => {

};

const handleEditQuote = async (client: Client, interaction: ChatInputCommandInteraction): Promise<void> => {

};

// Embed builders
export const quoteListEmbed = (pages: IQuote[][], page: number): EmbedBuilder => {
    return new EmbedBuilder()
    .setTitle(`Quotes (Page ${page + 1}/${pages.length})`)
    .setColor(parseInt("4DA4AD", 16))
    .addFields(pages[0].map((quote: IQuote) => {
        return {
            name: `"${quote.quote}" - ${quote.author?._id ? `${quote.author.displayName}#${quote.author.discriminator}` : quote.nonDiscordAuthor}`,
            value: `Created by ${quote.creator.displayName}#${quote.creator.discriminator} on <t:${quote.timestamp}:d>`
        }
    }));
}

// Error handlers
const noGuildError = async (interaction: ChatInputCommandInteraction): Promise<void> => {
    await interaction.reply({
        content: "Quotes are only available on discord servers/guilds!",
        ephemeral: true
    });
}
