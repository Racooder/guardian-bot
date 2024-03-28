import { Document, Model, Schema, model } from 'mongoose';
import { BotUser } from './botUser';
import { DiscordUser, RawDiscordUser, getDiscordUserData, getOrCreateDiscordUser } from './discordUser';
import { User } from 'discord.js';

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
    const tokenNumber = new Date().getTime() - 1672531200000;
    const token = tokenNumber.toString(36);
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
    const documents = await quoteModel.find({ user: botUser._id }).populate('user').populate('creator').populate('authors');
    return documents;
}

export async function getQuoteByToken(botUser: BotUser, token: string): Promise<Quote | null> {
    const document = await quoteModel.findOne({ user: botUser._id, token: token }).populate('user').populate('creator').populate('authors');
    return document;
}

export default quoteModel;