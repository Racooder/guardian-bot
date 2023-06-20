import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType, ChatInputCommandInteraction, GuildMember, ButtonStyle, InteractionReplyOptions } from "discord.js";
import { Command } from "../InteractionInterfaces";
import quoteSchema, { IQuote } from "../models/quoteSchema";
import guildMemberSchema, { IGuildMember } from "../models/guildMemberSchema";
import quoteListSchema from "../models/quoteListSchema";
import { isGuildCommand, parseDate, usernameString } from "../Essentials";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { generalError, invalidDateFormatError, noGuildError, notImplementedError, notMatchingSearchError } from "../InteractionReplies";
import guildSchema, { guildSettings } from "../models/guildSchema";
import Colors from "../Colors";
import { debug, error, warn } from "../Log";

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
                    type: ApplicationCommandOptionType.User,
                    name: "creator",
                    description: "The creator of the quote"
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "creator-name",
                    description: "The creator of the quote if they are not a discord user or left the server"
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "date",
                    description: "The approximate date the quote was created. Format: YYYY-MM-DD"
                }
            ]
        },
        // {
        //     type: ApplicationCommandOptionType.Subcommand,
        //     name: "edit",
        //     description: "Edit or delete your quotes"
        // }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        debug("Quote command called")

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
            case "new":
                reply = await handleNewQuote(interaction);
                break;
            case "list":
                reply = await handleListQuotes(interaction);
                break;
            case "search":
                reply = await handleSearchQuotes(interaction);
                break;
            case "edit":
                reply = await handleEditQuote(interaction);
                break;
            default:
                error(`Quote subcommand "${subcommand}" not found`);
                reply = generalError;
                break;
        }

        await interaction.reply(reply);
    }
}

// Subcommand handlers
/**
 * Create a new quote
 * @param client
 * @param interaction
 */
const handleNewQuote = async (interaction: ChatInputCommandInteraction): Promise<InteractionReplyOptions> => {
    debug("New quote subcommand called")

    if (!isGuildCommand(interaction)) {
        return noGuildError;
    }

    // Get the option values
    const quote = interaction.options.getString("quote", true);
    const author = interaction.options.getUser("author");
    const nonDiscordAuthor = interaction.options.getString("non-discord-author");

    // Check if any type of author was specified
    if (author === null && nonDiscordAuthor === null) {
        return {
            content: "You must specify a author or non-discord author!",
            ephemeral: true
        };
    }

    const creatorMember = interaction.member as GuildMember;

    debug("Updating creator and author names in the database")
    const creatorDocument = await guildMemberSchema.updateNames(interaction.guildId!, (await interaction.guild!.members.fetch(interaction.user.id)));
    let authorDocument: IGuildMember | null = null;
    if (author !== null) {
        authorDocument = await guildMemberSchema.updateNames(interaction.guildId!, (await interaction.guild!.members.fetch(author.id)));
    }

    // Create the quote
    debug(`Creating quote ${quote} in ${interaction.guildId}`)
    const quoteDocument = await quoteSchema.create({
        guildId: interaction.guildId!,
        quote: quote,
        timestamp: Math.floor(Date.now() / 1000),
        author: authorDocument?._id,
        nonDiscordAuthor: nonDiscordAuthor,
        creator: creatorDocument._id
    });

    // Create the embed
    const messageEmbed = new EmbedBuilder()
        .setTitle(`"${quoteDocument.quote}" - ${authorDocument?._id ? `${authorDocument.displayName}` : quoteDocument.nonDiscordAuthor}`)
        .setTimestamp(quoteDocument.timestamp * 1000)
        .setAuthor({
            name: creatorMember.displayName,
            iconURL: interaction.user.displayAvatarURL()
        })
        .setColor(Colors.quoteEmbed)

    // Return the embed
    return {
        embeds: [messageEmbed]
    };
}

/**
 * List all quotes on the guild
 * @param client
 * @param interaction
 */
const handleListQuotes = async (interaction: ChatInputCommandInteraction): Promise<InteractionReplyOptions> => {
    debug("List quotes subcommand called")

    if (!isGuildCommand(interaction)) {
        return noGuildError;
    }

    debug("Getting quotes from the database")
    const quoteChunks = await quoteSchema.listQuotes(interaction.guildId!, await guildSettings.quoteListPageSize(guildSchema, interaction.guildId!));

    // Check if there are any quotes
    if (quoteChunks.length === 0) {
        return {
            content: "There are no quotes on this server!",
            ephemeral: true
        };
    }
    
    debug("Creating quote list document")
    const quoteListDocument = await quoteListSchema.create({
        page: 0,
    })

    // Create the embed
    const messageEmbed = quoteListEmbed(quoteChunks, quoteListDocument.page);

    // Create the action row with next and previous page buttons
    const row = new ActionRowBuilder()
        .addComponents(previousPageButton(quoteListDocument._id, quoteListDocument.page > 0), nextPageButton(quoteListDocument._id, quoteListDocument.page < quoteChunks.length - 1));

    // Send the embed and action row
    return {
        embeds: [messageEmbed],
        components: [row]
    } as InteractionReplyOptions;
}

/**
 * Search for quotes
 * @param client
 * @param interaction
 */
const handleSearchQuotes = async (interaction: ChatInputCommandInteraction): Promise<InteractionReplyOptions> => {
    debug("Search quotes subcommand called")

    if (!isGuildCommand(interaction)) {
        return noGuildError;
    }

    // Get the option values
    const content = interaction.options.getString("content");
    const author = interaction.options.getUser("author");
    const authorName = interaction.options.getString("author-name");
    const creator = interaction.options.getUser("creator");
    const creatorName = interaction.options.getString("creator-name");
    const dateString = interaction.options.getString("date");

    // Check if any search parameters were specified
    if (content === null && author === null && authorName === null && creator === null && creatorName === null && dateString === null) {
        return {
            content: "You must specify at least one search parameter!",
            ephemeral: true
        };
    }

    // Parse the date
    let date: Date | undefined = parseDate(dateString);
    if (date === undefined) {
        return invalidDateFormatError;
    }

    debug("Getting quote chunks from the database")
    const quoteChunks = await quoteSchema.listQuotes(interaction.guildId!, await guildSettings.quoteListPageSize(guildSchema, interaction.guildId!), 
        content ?? undefined, 
        author?.id, 
        authorName ?? undefined,
        creator?.id,
        creatorName ?? undefined,
        date);

    // Check if there are any quotes
    if (quoteChunks.length === 0) {
        return notMatchingSearchError;
    }
    
    debug("Creating quote list document")
    const quoteListDocument = await quoteListSchema.create({
        page: 0,
        content: content,
        authorId: author?.id,
        authorName: authorName,
        creatorId: creator?.id,
        creatorName: creatorName,
        date: date
    })

    // Create the embed
    const queryDescription = `Quotes matching the following criteria:\n${content ? `Content: ${content}\n` : ""}${author ? `Author: ${usernameString(author)}\n` : ""}${authorName ? `Author Name: ${authorName}\n` : ""}${creator ? `Creator: ${usernameString(creator)}\n` : ""}${creatorName ? `Creator Name: ${creatorName}\n` : ""}${date ? `Date: ${date.toISOString().split("T")[0]}\n` : ""}`;
    const messageEmbed = quoteListEmbed(quoteChunks, quoteListDocument.page, queryDescription);

    // Create the action row with next and previous page buttons
    const row = new ActionRowBuilder()
        .addComponents(previousPageButton(quoteListDocument._id, quoteListDocument.page > 0), nextPageButton(quoteListDocument._id, quoteListDocument.page < quoteChunks.length - 1));

    // Send the embed and action row
    return {
        embeds: [messageEmbed],
        components: [row]
    } as InteractionReplyOptions;
}

const handleEditQuote = async (interaction: ChatInputCommandInteraction): Promise<InteractionReplyOptions> => {
    debug("Edit quote subcommand called")
    warn("Edit quote subcommand not implemented")

    return notImplementedError;
    // TODO: Implement
}

// Embed builders
/**
 * The embed builder for the quote list
 * @param pages - The pages of quotes
 * @param page - The current page
 * @param description - The description of the embed
 * @returns The embed builder
 */
export const quoteListEmbed = (pages: IQuote[][], page: number, description?: string): EmbedBuilder => {
    debug(`Building quote list embed for page ${page + 1}/${pages.length}`)

    if (page >= pages.length) {
        page = pages.length - 1;
    } else if (page < 0) {
        page = 0;
    }
    return new EmbedBuilder()
    .setTitle(`Quotes (Page ${page + 1}/${pages.length})`)
    .setDescription(description ?? null)
    .setColor(Colors.quoteEmbed)
    .addFields(pages[page].map((quote: IQuote) => {
        return {
            name: `"${quote.quote}" - ${quote.author?._id ? `${quote.author.displayName ?? quote.author.username}` : quote.nonDiscordAuthor}`,
            value: `Created by ${quote.creator.displayName} on <t:${quote.timestamp}:d>`
        }
    }));
}

// Button builders
/**
 * The button builder for the previous page button
 * @param quoteListId - The quote list id
 * @param enabled - Whether the button is enabled
 * @returns The button builder
 */
const previousPageButton = (quoteListId: string, enabled: boolean): ButtonBuilder => {
    debug(`Building previous page button for quote list ${quoteListId}`)

    return new ButtonBuilder()
        .setCustomId(`quotePage:previous:${quoteListId}`)
        .setLabel("Previous Page")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!enabled);
}

/**
 * The button builder for the next page button
 * @param quoteListId - The quote list id
 * @param enabled - Whether the button is enabled
 * @returns The button builder
 */
const nextPageButton = (quoteListId: string, enabled: boolean): ButtonBuilder => {
    debug(`Building next page button for quote list ${quoteListId}`)

    return new ButtonBuilder()
        .setCustomId(`quotePage:next:${quoteListId}`)
        .setLabel("Next Page")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!enabled);
}
