import { Document, Model, Schema, model } from 'mongoose';
import { DiscordUser, RawDiscordUser, getDiscordUserData, getOrCreateDiscordUser } from './discordUser';
import { Quote, getQuotes } from './quote';
import { BotUser } from './botUser';

export interface QuoteList extends Document {
    user: BotUser['_id'];
    page: number;
    content?: string;
    author?: DiscordUser['_id'];
    context?: string;
    creator?: DiscordUser['_id'];
    date?: Date;
}

export function getQuoteListQuery(quoteList: QuoteList) {
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
        query += `Date: ${quoteList.date}\n`;
    }
    return query;
}

interface QuoteListModel extends Model<QuoteList> { }

const quoteListSchema = new Schema<QuoteList, QuoteListModel>({
    user: { type: Schema.Types.ObjectId, ref: 'BotUsers', required: true },
    page: { type: Number, required: true },
    content: { type: String },
    author: { type: Schema.Types.ObjectId, ref: 'DiscordUsers' },
    context: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: 'DiscordUsers' },
    date: { type: Date },
});

const quoteListModel = model<QuoteList, QuoteListModel>('QuoteLists', quoteListSchema);

export async function createQuoteList(botUser: BotUser, content?: string, author?: RawDiscordUser, context?: string, creator?: RawDiscordUser, date?: Date): Promise<{ list: QuoteList, quotes: Quote[] }> {
    let authorUser: DiscordUser | undefined;
    let creatorUser: DiscordUser | undefined;
    if (author !== undefined) {
        if (typeof author === 'string') {
            authorUser = await getOrCreateDiscordUser(author, 'non-discord');
        } else {
            const authorData = getDiscordUserData(author);
            authorUser = await getOrCreateDiscordUser(authorData.name, authorData.type, author.id);
        }
    }

    const document = await quoteListModel.create({ user: botUser._id, page: 0, content, author: authorUser?._id, context, creator: creatorUser?._id, date });
    const list = await (await document.populate('author')).populate('creator');
    const quotes = await getQuotes(botUser);
    return { list, quotes };
}

export async function getQuoteList(id: QuoteList['_id']): Promise<QuoteList | null> {
    const document = await quoteListModel.findById(id);
    if (document === null) {
        return null;
    }
    const list = await (await document?.populate('author')).populate('creator');
    return list;
}

export default quoteListModel;
