import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, Client, EmbedBuilder } from "discord.js";
import { Command, ReplyType, Response } from "../Interactions";
import { debug, error, logToDiscord } from "../Log";
import { SubcommandExecutionFailure } from "../Failure";
import { RawStatistic } from "../models/statistic";
import statisticKeys from "../../data/statistic-keys.json";
import { QuoteList, createQuoteList, getQuoteListQuery } from '../models/quoteList';
import { parseDate, splitArrayIntoChunks } from "../Essentials";
import { RawDiscordUser } from "../models/discordUser";
import { Quote as QuoteType, createQuote, getQuoteByToken } from "../models/quote";

const MAX_CONVERSATION_LENGTH = 5;
export const QUOTE_PAGE_SIZE = 15;

export const Quote: Command = {
    name: "quote",
    description: "Add, remove, or list quotes.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "add",
            description: "Add a quote.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "quote",
                    description: "The quote to add.",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "author",
                    description: "The author of the quote.",
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
                {
                    name: "non-discord-author",
                    description: "The author of the quote if they are not on discord.",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: "context",
                    description: "The context of the quote.",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: "quote-2",
                    description: "The second quote to add. (For conversations)",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: "author-2",
                    description: "The author of the second quote. (For conversations)",
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
                {
                    name: "non-discord-author-2",
                    description: "The author of the second quote if they are not on discord. (For conversations)",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: "quote-3",
                    description: "The third quote to add. (For conversations)",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: "author-3",
                    description: "The author of the third quote. (For conversations)",
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
                {
                    name: "non-discord-author-3",
                    description: "The author of the third quote if they are not on discord. (For conversations)",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: "quote-4",
                    description: "The fourth quote to add. (For conversations)",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: "author-4",
                    description: "The author of the fourth quote. (For conversations)",
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
                {
                    name: "non-discord-author-4",
                    description: "The author of the fourth quote if they are not on discord. (For conversations)",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: "quote-5",
                    description: "The fifth quote to add. (For conversations)",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: "author-5",
                    description: "The author of the fifth quote. (For conversations)",
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
                {
                    name: "non-discord-author-5",
                    description: "The author of the fifth quote if they are not on discord. (For conversations)",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
            ],
        },
        {
            name: "remove",
            description: "Remove a quote.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "quote-token",
                    description: "The quote to remove.",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: "list",
            description: "List all quotes.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "content",
                    description: "The content query to filter quotes by.",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: "discord-author",
                    description: "The discord author of the quotes to list.",
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
                {
                    name: "author-name",
                    description: "The name of the author of the quotes to list.",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: "context",
                    description: "The context query to filter quotes by.",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: "creator",
                    description: "The creator of the quotes to list.",
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
                {
                    name: "creator-name",
                    description: "The name of the creator of the quotes to list.",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: "date",
                    description: "The date query to filter quotes by.",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: "date-range",
                    description: "The range in days of the date query. (Default: 3)",
                    type: ApplicationCommandOptionType.Integer,
                    required: false,
                }
            ],
        },
    ],
    run: async (client, interaction, botUser) => {
        debug("Quote command called");
        return new SubcommandExecutionFailure();
    },
    subcommands: {
        add: async (client, interaction, botUser) => {
            debug("Quote add subcommand called");

            const statistic: RawStatistic = {
                global: false,
                key: statisticKeys.bot.event.interaction.command.quote.add,
                user: botUser
            };

            const context: string | undefined = interaction.options.getString("context", false) ?? undefined;
            let quotes: string[] = [];
            let authors: RawDiscordUser[] = [];
            debug("Getting quote and author options")
            for (let i = 1; i <= MAX_CONVERSATION_LENGTH; i++) {
                let optionSuffix;
                if (i === 1) {
                    optionSuffix = "";
                } else {
                    optionSuffix = "-" + i.toString();
                }

                const quote = interaction.options.getString(`quote${optionSuffix}`, false);
                if (quote === null) {
                    for (let j = i + 1; j <= MAX_CONVERSATION_LENGTH; j++) {
                        if (interaction.options.getString(`quote-${j}`, false) !== null) {
                            const response: Response = {
                                replyType: ReplyType.Reply,
                                ephemeral: true,
                                content: `You defined quote ${j} but the quotes ${i} to ${j - 1} are missing.`,
                            };
                            return { response, statistic };
                        }
                    }
                    break;
                }

                const discordAuthor = interaction.options.getUser(`author${optionSuffix}`, false);
                const nonDiscordAuthor = interaction.options.getString(`non-discord-author${optionSuffix}`, false);
                if (discordAuthor === null && nonDiscordAuthor === null) {
                    const response: Response = {
                        replyType: ReplyType.Reply,
                        ephemeral: true,
                        content: `Quote ${i} is missing an author.`,
                    };
                    return { response, statistic };
                }
                if (discordAuthor !== null && nonDiscordAuthor !== null) {
                    const response: Response = {
                        replyType: ReplyType.Reply,
                        ephemeral: true,
                        content: `Quote ${i} can only have a discord or a non-discord author not both.`,
                    };
                    return { response, statistic };
                }

                quotes.push(quote);
                if (discordAuthor !== null) {
                    authors.push(discordAuthor);
                } else {
                    authors.push(nonDiscordAuthor!);
                }
            }

            await createQuote(botUser, interaction.user, quotes, authors, context);

            const response: Response = {
                replyType: ReplyType.Reply,
                ephemeral: true,
                content: "Your quote was added.",
            };

            return { response, statistic };
        },
        remove: async (client, interaction, botUser) => {
            debug("Quote remove subcommand called");

            const statistic: RawStatistic = {
                global: false,
                key: statisticKeys.bot.event.interaction.command.quote.remove,
                user: botUser
            };

            const token = interaction.options.getString("quote-token", true);
            const document = await getQuoteByToken(botUser, token);
            if (document === null) {
                const response: Response = {
                    replyType: ReplyType.Reply,
                    ephemeral: true,
                    content: "Quote not found.",
                };
                return { response, statistic };
            }

            if (document.creator.userId !== interaction.user.id) { // && !hasPermission(interaction.member, PermissionsBitField.Flags.ManageMessages)
                const response: Response = {
                    replyType: ReplyType.Reply,
                    ephemeral: true,
                    content: "You do not have permission to remove this quote.",
                };
                return { response, statistic };
            }

            await document.deleteOne();
            const response: Response = {
                replyType: ReplyType.Reply,
                ephemeral: true,
                content: "Quote removed.",
            };
            return { response, statistic };
        },
        list: async (client, interaction, botUser) => {
            debug("Quote list subcommand called");

            const statistic: RawStatistic = {
                global: false,
                key: statisticKeys.bot.event.interaction.command.quote.list,
                user: botUser
            };

            const content = interaction.options.getString("content", false) ?? undefined;
            const authorUser = interaction.options.getUser("discord-author", false) ?? undefined;
            const authorName = interaction.options.getString("author-name", false) ?? undefined;
            const context = interaction.options.getString("context", false) ?? undefined;
            const creatorUser = interaction.options.getUser("creator", false) ?? undefined;
            const creatorName = interaction.options.getString("creator-name", false) ?? undefined;
            const dateString = interaction.options.getString("date", false) ?? undefined;
            const dateRange = interaction.options.getInteger("date-range", false) ?? undefined;

            if (authorUser !== undefined && authorName !== undefined) {
                const response: Response = {
                    replyType: ReplyType.Reply,
                    ephemeral: true,
                    content: "You cannot specify both an author and an author name.",
                };
                return { response, statistic };
            }
            if (creatorUser !== undefined && creatorName !== undefined) {
                const response: Response = {
                    replyType: ReplyType.Reply,
                    ephemeral: true,
                    content: "You cannot specify both a creator and a creator name.",
                };
                return { response, statistic };
            }

            const author = authorUser ?? authorName;
            const creator = creatorUser ?? creatorName;

            const date = parseDate(dateString);
            if (dateString !== undefined && date === undefined) {
                const response: Response = {
                    replyType: ReplyType.Reply,
                    ephemeral: true,
                    content: "Invalid date format. The correct format is YYYY-MM-DD.",
                };
                return { response, statistic };
            }

            const [list, quotes] = await createQuoteList(botUser, content, author, context, creator, date, dateRange);
            if (quotes.length === 0) {
                const response: Response = {
                    replyType: ReplyType.Reply,
                    ephemeral: true,
                    content: "No quotes found.",
                };
                return { response, statistic };
            }

            const [embedBuilder, actionRow] = await quoteListMessage(list, quotes, client, 0);

            const response: Response = {
                replyType: ReplyType.Reply,
                embeds: [embedBuilder],
                components: [actionRow],
            };

            return { response, statistic };
        },
    },
};

export async function quoteListMessage(list: QuoteList, quotes: QuoteType[], client: Client, page: number): Promise<[EmbedBuilder, ActionRowBuilder<ButtonBuilder>]> {
    debug("Creating quote list message");

    const query = getQuoteListQuery(list);
    const quoteChunks = splitArrayIntoChunks(quotes.reverse(), QUOTE_PAGE_SIZE);
    const pageQuotes = quoteChunks[page];

    let embedDescription = `Showing ${pageQuotes.length} quotes`;
    if (query !== "") {
        embedDescription += ` matching:\n${query}`;
    }

    debug("Creating quote embed fields");
    const embedFields = await Promise.all(pageQuotes.map((quote) => quoteEmbedField(quote, client)));

    const embedBuilder = new EmbedBuilder()
        .setTitle(`Quotes (Page ${page + 1}/${quoteChunks.length})`)
        .setDescription(embedDescription)
        .addFields(embedFields);

    const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`quote-page:first:${list._id}`)
                .setEmoji('⏪')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 0),
            new ButtonBuilder()
                .setCustomId(`quote-page:page:${list._id}:${page - 1}`)
                .setEmoji('◀️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 0),
            new ButtonBuilder()
                .setCustomId(`quote-page:page:${list._id}:${page + 1}`)
                .setEmoji('▶️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === quoteChunks.length - 1),
            new ButtonBuilder()
                .setCustomId(`quote-page:last:${list._id}`)
                .setEmoji('⏩')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === quoteChunks.length - 1),
            new ButtonBuilder()
                .setCustomId(`quote-page:page:${list._id}:${page}`)
                .setEmoji('🔄')
                .setStyle(ButtonStyle.Secondary)
        );

    return [embedBuilder, actionRow];
}

async function quoteEmbedField(quote: QuoteType, client: Client) {
    if (quote.authors.length !== quote.statements.length) {
        logToDiscord(client, error(`Quote ${quote.token} has a mismatch between the number of authors and statements or can't be populated correctly.`));
        return {
            name: "Error",
            value: "An error occurred while formatting this quote",
            inline: false,
        }
    }
    let description = "";
    for (let i = 0; i < quote.statements.length; i++) {
        const statement = quote.statements[i];
        const author = quote.authors[i];
        if (author.name === null) {
            description += `"${statement}" - ???\n`;
            continue;
        }
        description += `"${statement}" - ${author.name}\n`;
    }
    return {
        name: `Created by ${quote.creator.name} (Token: \`${quote.token}\`)`,
        value: description,
        inline: false,
    }
}
