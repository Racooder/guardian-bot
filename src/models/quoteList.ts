import { Document, Model, Schema, model } from 'mongoose';
import { DiscordUserDoc, RawDiscordUser, getDiscordUserData, getOrCreateDiscordUser } from './discordUser';
import quoteModel, { QuotePopulatedCreatorAuthors } from './quote';
import { BotUserDoc } from './botUser';
import { approximateEqual, getAccessableConnections } from '../Essentials';
import { debug } from '../Log';

const QUOTE_DATE_RANGE = 259200000; // 3 days in milliseconds

type QuoteQuery = {
    user: BotUserDoc['_id'];
    creator?: DiscordUserDoc['_id'];
    authors?: DiscordUserDoc['_id'];
}

export interface QuoteListDoc extends Document {
    user: BotUserDoc['_id'];
    content?: string;
    author?: DiscordUserDoc['_id'];
    context?: string;
    creator?: DiscordUserDoc['_id'];
    date?: Date;

    createdAt: Date;
    updatedAt: Date;
}

export interface QuoteListPopulated extends QuoteListDoc {
    user: BotUserDoc;
    author?: DiscordUserDoc;
    creator?: DiscordUserDoc;
}

export function getQuoteListQuery(quoteList: QuoteListPopulated) {
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

interface QuoteListModel extends Model<QuoteListDoc> { }

const quoteListSchema = new Schema<QuoteListDoc, QuoteListModel>({
    user: { type: Schema.Types.ObjectId, ref: 'BotUsers', required: true },
    content: { type: String },
    author: { type: Schema.Types.ObjectId, ref: 'DiscordUsers' },
    context: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: 'DiscordUsers' },
    date: { type: Date },
}, { timestamps: true });

const quoteListModel = model<QuoteListDoc, QuoteListModel>('QuoteLists', quoteListSchema);

export async function createQuoteList(botUser: BotUserDoc, content?: string, author?: RawDiscordUser, context?: string, creator?: RawDiscordUser, date?: Date, dateRange?: number): Promise<[QuoteListPopulated, QuotePopulatedCreatorAuthors[]]> {
    debug("Creating quote list entry")

    let authorUser: DiscordUserDoc | undefined;
    let creatorUser: DiscordUserDoc | undefined;

    const document = await quoteListModel.create({ user: botUser, content, author: authorUser, context, creator: creatorUser, date }) as QuoteListDoc;
    const list = await (await document.populate('author')).populate('creator') as QuoteListPopulated;

    const targets = await getAccessableConnections(botUser);
    let query: QuoteQuery = { user: { $in: targets } };
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

    let quotes = await quoteModel
        .find(query)
        .populate("creator")
        .populate("authors")
        .exec() as QuotePopulatedCreatorAuthors[];
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

export async function getQuoteList(id: QuoteListDoc['_id']): Promise<QuoteListPopulated | null> {
    debug(`Getting quote list ${id}`);

    return await quoteListModel
        .findById(id)
        .populate('user')
        .populate('author')
        .populate('creator')
        .exec() as QuoteListPopulated | null;
}

export default quoteListModel;
