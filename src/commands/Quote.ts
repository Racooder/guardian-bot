import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType, ChatInputCommandInteraction, GuildMember, ButtonStyle, InteractionReplyOptions, APIEmbedField } from "discord.js";
import { Command } from "../InteractionInterfaces";
import quoteSchema, { IQuote } from "../models/quoteSchema";
import guildMemberSchema, { IGuildMember } from "../models/guildMemberSchema";
import quoteListSchema from "../models/quoteListSchema";
import { handleSubcommands, isGuildCommand, parseDate, usernameString } from "../Essentials";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { generalError, invalidDateFormatError, noGuildError, notImplementedError, notMatchingSearchError } from "../InteractionReplies";
import guildSchema, { guildSettings } from "../models/guildSchema";
import Colors from "../Colors";
import { debug, error, warn } from '../Log';
import { StatisticType } from "../models/statisticsSchema";

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
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "conversation",
            description: "Create a quote from a conversation",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "quote-1",
                    description: "The first quote",
                    required: true
                },
                {
                    type: ApplicationCommandOptionType.User,
                    name: "author-1",
                    description: "The author of the first quote"
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "non-discord-author-1",
                    description: "The author of the first quote if they are not a discord user"
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "quote-2",
                    description: "The second quote"
                },
                {
                    type: ApplicationCommandOptionType.User,
                    name: "author-2",
                    description: "The author of the second quote"
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "non-discord-author-2",
                    description: "The author of the second quote if they are not a discord user"
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "quote-3",
                    description: "The third quote"
                },
                {
                    type: ApplicationCommandOptionType.User,
                    name: "author-3",
                    description: "The author of the third quote"
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "non-discord-author-3",
                    description: "The author of the third quote if they are not a discord user"
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "quote-4",
                    description: "The fourth quote"
                },
                {
                    type: ApplicationCommandOptionType.User,
                    name: "author-4",
                    description: "The author of the fourth quote"
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "non-discord-author-4",
                    description: "The author of the fourth quote if they are not a discord user"
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "quote-5",
                    description: "The fifth quote"
                },
                {
                    type: ApplicationCommandOptionType.User,
                    name: "author-5",
                    description: "The author of the fifth quote"
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "non-discord-author-5",
                    description: "The author of the fifth quote if they are not a discord user"
                }
            ]
        }
        // {
        //     type: ApplicationCommandOptionType.Subcommand,
        //     name: "edit",
        //     description: "Edit or delete your quotes"
        // }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        debug("Quote command called");

        if (!interaction.isChatInputCommand()) {
            error("Quote command was not a chat input command", client);
            await interaction.reply(generalError);
            return;
        }
        if (!isGuildCommand(interaction)) {
            debug("Quote command was not a guild command"); // This happens when the command is run in a DM
            await interaction.reply(noGuildError);
            return;
        }

        await handleSubcommands(interaction, interaction.options.getSubcommand(), [
            {
                key: "new",
                run: handleNewQuote,
                stats: [StatisticType.Command_Quote_New]
            },
            {
                key: "list",
                run: handleListQuotes,
                stats: [StatisticType.Command_Quote_List]
            },
            {
                key: "search",
                run: handleSearchQuotes,
                stats: [StatisticType.Command_Quote_Search]
            },
            {
                key: "conversation",
                run: handleConversation,
                stats: [StatisticType.Command_Quote_Conversation]
            },
            {
                key: "edit",
                run: handleEditQuote,
                stats: [StatisticType.Command_Quote_Edit]
            }
        ], [StatisticType.Command_Quote]);
    }
}

// Subcommand handlers
/**
 * Create a new quote
 * @param client
 * @param interaction
 */
const handleNewQuote = async (interaction: ChatInputCommandInteraction): Promise<InteractionReplyOptions> => {
    debug("New quote subcommand called");

    // Get the option values
    const quote = interaction.options.getString("quote", true);
    const author = interaction.options.getUser("author");
    const nonDiscordAuthor = interaction.options.getString("non-discord-author");

    // Check if any type of author was specified
    if (author === null && nonDiscordAuthor === null) {
        debug("No author specified");
        return {
            content: "You must specify a author or non-discord author!",
            ephemeral: true
        };
    }

    const creatorMember = interaction.member as GuildMember;

    debug("Updating creator and author names in the database");
    const creatorDocument = await guildMemberSchema.updateNames(interaction.guildId!, creatorMember);
    let authorDocument: IGuildMember | null = null;
    if (author !== null) {
        authorDocument = await guildMemberSchema.updateNames(interaction.guildId!, (await interaction.guild!.members.fetch(author.id)));
    }

    debug(`Creating quote ${quote} in guild: ${interaction.guild!.name}(${interaction.guildId})`);
    const quoteDocument = await quoteSchema.create({
        guildId: interaction.guildId!,
        quote: quote,
        timestamp: Math.floor(Date.now() / 1000),
        author: authorDocument?._id,
        nonDiscordAuthor: nonDiscordAuthor,
        creator: creatorDocument._id
    });

    debug("Building the embed");
    const messageEmbed = new EmbedBuilder()
        .setTitle(`"${quoteDocument.quote}" - ${authorDocument?._id ? `${authorDocument.displayName}` : quoteDocument.nonDiscordAuthor}`)
        .setTimestamp(quoteDocument.timestamp * 1000)
        .setAuthor({
            name: creatorMember.displayName,
            iconURL: interaction.user.displayAvatarURL()
        })
        .setColor(Colors.quoteEmbed)

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
    debug("List quotes subcommand called");

    debug("Getting quotes from the database");
    const quoteChunks = await quoteSchema.listQuotes(interaction.guildId!, await guildSettings.quoteListPageSize(guildSchema, interaction.guildId!));

    // Check if there are any quotes
    if (quoteChunks.length === 0) {
        debug("There are no quotes on this server");
        return {
            content: "There are no quotes on this server!",
            ephemeral: true
        };
    }
    
    debug("Creating quote list document");
    const quoteListDocument = await quoteListSchema.create({
        page: 0,
    })

    debug(`Building the embed and action row for quote list: ${quoteListDocument._id}`);
    const messageEmbed = await quoteListEmbed(quoteChunks, quoteListDocument.page);
    const row = new ActionRowBuilder()
        .addComponents(previousPageButton(quoteListDocument._id, quoteListDocument.page > 0), nextPageButton(quoteListDocument._id, quoteListDocument.page < quoteChunks.length - 1));

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
    debug("Search quotes subcommand called");

    // Get the option values
    const content = interaction.options.getString("content");
    const author = interaction.options.getUser("author");
    const authorName = interaction.options.getString("author-name");
    const creator = interaction.options.getUser("creator");
    const creatorName = interaction.options.getString("creator-name");
    const dateString = interaction.options.getString("date");

    // Check if any search parameters were specified
    if (content === null && author === null && authorName === null && creator === null && creatorName === null && dateString === null) {
        debug("No search parameters specified");
        return {
            content: "You must specify at least one search parameter!",
            ephemeral: true
        };
    }

    if (dateString !== null) {
        debug("Parsing date");
        var date: Date | undefined = parseDate(dateString);
        if (date === undefined) {
            debug("Invalid date format provided");
            return invalidDateFormatError;
        }
    }

    debug("Getting quote chunks from the database");
    const quoteChunks = await quoteSchema.listQuotes(interaction.guildId!, await guildSettings.quoteListPageSize(guildSchema, interaction.guildId!), 
        content ?? undefined, 
        author?.id, 
        authorName ?? undefined,
        creator?.id,
        creatorName ?? undefined,
        date);

    // Check if there are any quotes
    if (quoteChunks.length === 0) {
        debug("No quotes matched the search criteria");
        return notMatchingSearchError;
    }
    
    debug("Creating quote list document");
    const quoteListDocument = await quoteListSchema.create({
        page: 0,
        content: content,
        authorId: author?.id,
        authorName: authorName,
        creatorId: creator?.id,
        creatorName: creatorName,
        date: date
    })

    debug(`Building the embed and action row for quote list: ${quoteListDocument._id}`);
    const queryDescription = `Quotes matching the following criteria:\n${content ? `Content: ${content}\n` : ""}${author ? `Author: ${usernameString(author)}\n` : ""}${authorName ? `Author Name: ${authorName}\n` : ""}${creator ? `Creator: ${usernameString(creator)}\n` : ""}${creatorName ? `Creator Name: ${creatorName}\n` : ""}${date ? `Date: ${date.toISOString().split("T")[0]}\n` : ""}`;
    const messageEmbed = await quoteListEmbed(quoteChunks, quoteListDocument.page, queryDescription);
    const row = new ActionRowBuilder()
        .addComponents(previousPageButton(quoteListDocument._id, quoteListDocument.page > 0), nextPageButton(quoteListDocument._id, quoteListDocument.page < quoteChunks.length - 1));

    return {
        embeds: [messageEmbed],
        components: [row]
    } as InteractionReplyOptions;
}

const handleConversation = async (interaction: ChatInputCommandInteraction): Promise<InteractionReplyOptions> => {
    debug("Conversation subcommand called");
    
    debug("Getting the option values");
    var quotes = [
        interaction.options.getString("quote-1", true),
        interaction.options.getString("quote-2"),
        interaction.options.getString("quote-3"),
        interaction.options.getString("quote-4"),
        interaction.options.getString("quote-5")
    ];
    var authors = [
        interaction.options.getUser("author-1"),
        interaction.options.getUser("author-2"),
        interaction.options.getUser("author-3"),
        interaction.options.getUser("author-4"),
        interaction.options.getUser("author-5")
    ];
    var nonDiscordAuthors = [
        interaction.options.getString("non-discord-author-1"),
        interaction.options.getString("non-discord-author-2"),
        interaction.options.getString("non-discord-author-3"),
        interaction.options.getString("non-discord-author-4"),
        interaction.options.getString("non-discord-author-5")
    ];
    let authorDocumentIds: any[] = [];

    debug("Check if the options are valid and convert the authors to database guild members");
    for (let i = 0; i < quotes.length; i++) {
        if (quotes[i] === null) {
            quotes.splice(i, quotes.length - i);
            authors.splice(i, quotes.length - i);
            nonDiscordAuthors.splice(i, quotes.length - i);
            break;
        }

        if (authors[i] === null && nonDiscordAuthors[i] === null) {
            debug("No author specified");
            return {
                content: `You must specify an author or non-discord author for quote ${i + 1}!`,
                ephemeral: true
            };
        }
        if (authors[i] !== null && nonDiscordAuthors[i] !== null) {
            debug("Both author and non-discord author specified");
            return {
                content: `You must specify either an author or non-discord author for quote ${i + 1}, not both!`,
                ephemeral: true
            };
        }
        if (authors[i] !== null) {
            debug(`Updating author ${i + 1} name in the database`);
            const authorDocument = await guildMemberSchema.updateNames(interaction.guildId!, authors[i]!)
            authorDocumentIds[i] = authorDocument._id;
        }
    }

    if (quotes.length < 2) {
        debug("Not enough quotes specified");
        return {
            content: "You must specify at least 2 quotes!",
            ephemeral: true
        };
    }

    const creatorMember = interaction.member as GuildMember;

    debug("Updating creator name in the database");
    const creatorDocument = await guildMemberSchema.updateNames(interaction.guildId!, creatorMember);

    debug(`Creating conversation quote in guild: ${interaction.guild!.name}(${interaction.guildId})`);
    const conversationDocument = await quoteSchema.create({
        guildId: interaction.guildId!,
        conversation: quotes,
        timestamp: Math.floor(Date.now() / 1000),
        conversationAuthors: authorDocumentIds,
        conversationNonDiscordAuthors: nonDiscordAuthors,
        creator: creatorDocument._id
    });

    debug("Getting the author names");
    const authorNames = await conversationDocument.conversationAuthorNames;

    debug("Building the embed");
    const messageEmbed = new EmbedBuilder()
        .setTitle(`Conversation`)
        .setTimestamp(conversationDocument.timestamp * 1000)
        .setAuthor({
            name: creatorMember.displayName,
            iconURL: interaction.user.displayAvatarURL()
        })
        .setColor(Colors.quoteEmbed)
        .setDescription(quotes.map((quote, index) => {
            return `"${quote}" - ${authorNames[index]}`;
        }).join("\n"));

    return {
        embeds: [messageEmbed]
    };
}

const handleEditQuote = async (interaction: ChatInputCommandInteraction): Promise<InteractionReplyOptions> => {
    debug("Edit quote subcommand called");
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
export const quoteListEmbed = async (pages: IQuote[][], page: number, description?: string): Promise<EmbedBuilder> => {
    debug(`Building quote list embed for page ${page + 1}/${pages.length}`);

    if (page >= pages.length) {
        page = pages.length - 1;
    } else if (page < 0) {
        page = 0;
    }

    let embedFields: APIEmbedField[] = [];
    for (let i = 0; i < pages[page].length; i++) {
        const quote = pages[page][i];
        if (quote.conversation?.length) {
            console.log(quote.conversation);
            const authorNames = await quote.conversationAuthorNames;

            embedFields.push({
                name: `Conversation - Created by ${quote.creator.displayName} on <t:${quote.timestamp}:d>`,
                value: quote.conversation!.map((q, index) => {
                    return `"${q}" - ${authorNames[index]}`;
                }).join("\n")
            });
        } else {
            embedFields.push({
                name: `"${quote.quote}" - ${await quote.authorName}`,
                value: `Created by ${quote.creator.displayName} on <t:${quote.timestamp}:d>`
            });
        }
    }

    const embedBuilder = new EmbedBuilder()
        .setTitle(`Quotes (Page ${page + 1}/${pages.length})`)
        .setDescription(description ?? null)
        .setColor(Colors.quoteEmbed)
        .addFields(embedFields);

    return Promise.resolve(embedBuilder);
}

// Button builders
/**
 * The button builder for the previous page button
 * @param quoteListId - The quote list id
 * @param enabled - Whether the button is enabled
 * @returns The button builder
 */
const previousPageButton = (quoteListId: string, enabled: boolean): ButtonBuilder => {
    debug(`Building previous page button`);

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
    debug(`Building next page button`);
    
    return new ButtonBuilder()
        .setCustomId(`quotePage:next:${quoteListId}`)
        .setLabel("Next Page")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!enabled);
}
