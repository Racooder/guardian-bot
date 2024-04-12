import { Document, Model, Schema, model } from 'mongoose';
import { DiscordUser, RawDiscordUser, getDiscordUserData, getOrCreateDiscordUser } from './discordUser';
import quoteModel, { Quote } from './quote';
import { BotUser } from './botUser';
import { approximateEqual } from '../Essentials';
import { debug } from '../Log';

const QUOTE_DATE_RANGE = 259200000; // 3 days in milliseconds

type QuoteQuery = {
    user: BotUser['_id'];
    creator?: DiscordUser['_id'];
    authors?: DiscordUser['_id'];
}

export interface QuoteList extends Document {
    user: BotUser['_id'];
    content?: string;
    author?: DiscordUser['_id'];
    context?: string;
    creator?: DiscordUser['_id'];
    date?: Date;
}

export function getQuoteListQuery(quoteList: QuoteList) {
    debug("Getting quote list query")

    let query = "";
    if (quoteList.content !== undefined) {
        query += `Content: ${quoteList.content}\n`;
    }
    if (quoteList.author !== undefined) {
        query += `Author: ${quoteList.author.name}\n`;
    }
    if (quoteList.context !== undefined) {
        query += `Context: ${quoteList.context}\n`;
    }
    if (quoteList.creator !== undefined) {
        query += `Creator: ${quoteList.creator.name}\n`;
    }
    if (quoteList.date !== undefined) {
        query += `Date: ${quoteList.date.toISOString().split('T')[0]}\n`;
    }
    return query;
}

interface QuoteListModel extends Model<QuoteList> { }

const quoteListSchema = new Schema<QuoteList, QuoteListModel>({
    user: { type: Schema.Types.ObjectId, ref: 'BotUsers', required: true },
    content: { type: String },
    author: { type: Schema.Types.ObjectId, ref: 'DiscordUsers' },
    context: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: 'DiscordUsers' },
    date: { type: Date },
});

const quoteListModel = model<QuoteList, QuoteListModel>('QuoteLists', quoteListSchema);

export async function createQuoteList(botUser: BotUser, content?: string, author?: RawDiscordUser, context?: string, creator?: RawDiscordUser, date?: Date, dateRange?: number): Promise<[QuoteList, Quote[]]> {
    debug("Creating quote list entry")

    let authorUser: DiscordUser | undefined;
    let creatorUser: DiscordUser | undefined;
    let query: QuoteQuery = { user: botUser._id };
    if (author && typeof author !== 'string') {
        const authorData = getDiscordUserData(author);
        authorUser = await getOrCreateDiscordUser(authorData.name, authorData.type, author.id);
        query.authors = authorUser._id;
    }
    if (creator && typeof creator !== 'string') {
        const creatorData = getDiscordUserData(creator);
        creatorUser = await getOrCreateDiscordUser(creatorData.name, creatorData.type, creator.id);
        query.creator = creatorUser._id;
    }

    const document = await quoteListModel.create({ user: botUser._id, content, author: authorUser?._id, context, creator: creatorUser?._id, date });
    const list = await (await document.populate('author')).populate('creator');

    let quotes = await quoteModel.find(query).populate("creator").populate("authors").exec();
    quotes = quotes.filter(quote => {
        if (content !== undefined) {
            let found = false;
            for (const statement of quote.statements) {
                if (statement.includes(content)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return false;
            }
        }
        if (context !== undefined && quote.context && !quote.context.includes(context)) {
            return false;
        }
        if (date !== undefined && !approximateEqual(quote.createdAt.getTime(), date.getTime(), dateRange ?? QUOTE_DATE_RANGE)){
            return false;
        }
        return true;
    });

    return [list, quotes];
}

export async function getQuoteList(id: QuoteList['_id']): Promise<QuoteList | null> {
    debug(`Getting quote list ${id}`);

    const document = await quoteListModel.findById(id);
    if (document === null) {
        return null;
    }
    const list = await (await document?.populate('author')).populate('creator');
    return list;
}

export default quoteListModel;
