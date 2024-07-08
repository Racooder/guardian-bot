import { Document, Model, Schema, model } from 'mongoose';
import { BotUserDoc } from './botUser';
import { DiscordUserDoc, RawDiscordUser, getDiscordUserData, getOrCreateDiscordUser } from './discordUser';
import { User } from 'discord.js';
import { generateToken, getAccessableConnections } from '../Essentials';
import { debug } from '../Log';

export interface QuoteDoc extends Document {
    token: string;
    user: BotUserDoc['_id'];
    creator: DiscordUserDoc['_id'];
    isConversation: boolean;
    statements: string[];
    authors: DiscordUserDoc['_id'][];
    context?: string;

    createdAt: Date;
    updatedAt: Date;
}

export interface QuotePopulated extends QuoteDoc {
    user: BotUserDoc;
    creator: DiscordUserDoc;
    authors: DiscordUserDoc[];
}

export interface QuotePopulatedCreatorAuthors extends QuoteDoc {
    creator: DiscordUserDoc;
    authors: DiscordUserDoc[];
}

interface QuoteModel extends Model<QuoteDoc> { }

const quoteSchema = new Schema<QuoteDoc, QuoteModel>({
    token: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'BotUsers', required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'DiscordUsers', required: true },
    statements: { type: [String], required: true },
    isConversation: { type: Boolean, required: true },
    authors: [{ type: Schema.Types.ObjectId, ref: 'DiscordUsers', required: true }],
    context: { type: String, required: false }
}, { timestamps: true });

const quoteModel = model<QuoteDoc, QuoteModel>('Quotes', quoteSchema);

export async function createQuote(botUser: BotUserDoc, creatorUser: User, statements: string[], authors: RawDiscordUser[], context?: string): Promise<QuotePopulated> {
    debug("Creating quote entry")

    const token = generateToken();
    const creatorData = getDiscordUserData(creatorUser);
    const creator = await getOrCreateDiscordUser(creatorData.name, creatorData.type, creatorUser.id);
    const authorDocs: DiscordUserDoc[] = [];
    for (const author of authors) {
        if (typeof author === 'string') {
            const authorUser = await getOrCreateDiscordUser(author, 'non-discord');
            authorDocs.push(authorUser);
        } else {
            const authorData = getDiscordUserData(author);
            const authorUser = await getOrCreateDiscordUser(authorData.name, authorData.type, author.id);
            authorDocs.push(authorUser);
        }
    }
    const isConversation = statements.length > 1;

    return await quoteModel.create({ token, user: botUser, creator, isConversation, statements, authors: authorDocs, context }) as QuotePopulated;
}

export async function getQuotes(botUser: BotUserDoc): Promise<QuotePopulated[]> {
    debug(`Getting quotes for bot user ${botUser.id}`);

    const targets = await getAccessableConnections(botUser);

    const documents = await quoteModel
        .find({ user: { $in: targets } })
        .populate('user')
        .populate('creator')
        .populate('authors')
        .exec() as QuotePopulated[];
    return documents;
}

export async function getQuoteByToken(botUser: BotUserDoc, token: string): Promise<QuotePopulated | null> {
    debug(`Getting quote ${token} for bot user ${botUser.id}`);

    const document = await quoteModel
        .findOne({ user: botUser._id, token: token })
        .populate('user')
        .populate('creator')
        .populate('authors')
        .exec() as QuotePopulated | null;
    return document;
}

export async function randomQuote(botUser: BotUserDoc, exclude: QuoteDoc['_id'][] = []): Promise<[QuoteDoc?, Map<string, string>?, [string, string]?]> {
    debug(`Getting random quote for bot user ${botUser.id}`);

    const targets = await getAccessableConnections(botUser);

    const query = { _id: { $nin: exclude }, user: { $in: targets }, isConversation: false };
    const documentCount = await quoteModel
        .countDocuments(query)
        .exec();
    const randomIndex = Math.floor(Math.random() * documentCount);
    const quote = await quoteModel
        .findOne(query)
        .skip(randomIndex)
        .populate('user')
        .populate('creator')
        .populate('authors')
        .exec() as QuotePopulated | null;

    if (!quote) return [];

    const correctAuthor = [quote.authors[0].name.toLowerCase(), quote.authors[0].name] as [string, string];

    const authorCollections = await quoteModel
        .find({ user: { $in: targets } })
        .populate('authors')
        .select('authors')
        .exec();
    const authors = new Map<string, string>();
    for (const collection of authorCollections) {
        for (const author of collection.authors as DiscordUserDoc[]) {
            if (author.name.toLowerCase() === correctAuthor[0]) continue;
            authors.set(author.name.toLowerCase(), author.name);
        }
    }

    return [quote, authors, correctAuthor];
}

export default quoteModel;
