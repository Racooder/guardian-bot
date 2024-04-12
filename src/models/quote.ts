import { Document, Model, Schema, model } from 'mongoose';
import { BotUser } from './botUser';
import { DiscordUser, RawDiscordUser, getDiscordUserData, getOrCreateDiscordUser } from './discordUser';
import { User } from 'discord.js';
import { Dict, generateToken } from '../Essentials';
import { debug } from '../Log';

export interface Quote extends Document {
    token: string;
    user: BotUser['_id'];
    creator: DiscordUser['_id'];
    statements: string[];
    authors: DiscordUser['_id'][];
    context?: string;

    createdAt: Date;
    updatedAt: Date;
}

interface QuoteModel extends Model<Quote> { }

const quoteSchema = new Schema<Quote, QuoteModel>({
    token: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'BotUsers', required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'DiscordUsers', required: true },
    statements: { type: [String], required: true },
    authors: [{ type: Schema.Types.ObjectId, ref: 'DiscordUsers', required: true }],
    context: { type: String, required: false }
}, { timestamps: true });

const quoteModel = model<Quote, QuoteModel>('Quotes', quoteSchema);

export async function createQuote(botUser: BotUser, creatorUser: User, statements: string[], authors: RawDiscordUser[], context?: string): Promise<Quote> {
    debug("Creating quote entry")

    const token = generateToken();
    const creatorData = getDiscordUserData(creatorUser);
    const creator = await getOrCreateDiscordUser(creatorData.name, creatorData.type, creatorUser.id);
    let authorIds: DiscordUser['_id'][] = [];
    for (const author of authors) {
        if (typeof author === 'string') {
            const authorUser = await getOrCreateDiscordUser(author, 'non-discord');
            authorIds.push(authorUser._id);
        } else {
            const authorData = getDiscordUserData(author);
            const authorUser = await getOrCreateDiscordUser(authorData.name, authorData.type, author.id);
            authorIds.push(authorUser._id);
        }
    }

    return await quoteModel.create({ token, user: botUser._id, creator: creator._id, statements: statements, authors: authorIds, context });
}

export async function getQuotes(botUser: BotUser): Promise<Quote[]> {
    debug(`Getting quotes for bot user ${botUser.id}`);

    const documents = await quoteModel.find({ user: botUser._id }).populate('user').populate('creator').populate('authors');
    return documents;
}

export async function getQuoteByToken(botUser: BotUser, token: string): Promise<Quote | null> {
    debug(`Getting quote ${token} for bot user ${botUser.id}`);

    const document = await quoteModel.findOne({ user: botUser._id, token: token }).populate('user').populate('creator').populate('authors').exec();
    return document;
}

export async function randomQuote(botUser: BotUser, exclude: Quote['_id'][] = []): Promise<[Quote?, [string, string]?, [string, string][]?]> {
    debug(`Getting random quote for bot user ${botUser.id}`);

    const documents = await quoteModel.find({ _id: { $nin: exclude }, user: botUser }).populate('user').populate('creator').populate('authors').exec();
    if (documents.length === 0) return [undefined, undefined];
    const quote = documents[Math.floor(Math.random() * documents.length)];

    debug("Getting all quote authors for the bot user")
    let authorsDict: Dict<string> = {};
    for (const doc of documents) {
        for (const author of doc.authors) {
            authorsDict[author.name.toLowerCase()] = author.name;
        }
    }

    debug("Seperating quote author from other authors")
    const authors = Object.entries(authorsDict);
    const quoteAuthor = [quote.authors[0].name.toLowerCase(), quote.authors[0].name] as [string, string];
    const quoteAuthorIndex = authors.map(author => author[0]).indexOf(quoteAuthor[0]);
    authors.splice(quoteAuthorIndex, 1);

    return [quote, quoteAuthor, authors];
}

export default quoteModel;
