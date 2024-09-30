import { Document, Model, Schema, model } from 'mongoose';
import { generateToken, getAccessableConnections } from '../Essentials';
import quoteModel, { QuoteDoc, QuotePopulated } from './quote';
import { debug } from '../Log';
import { DiscordUserDoc } from './discordUser';
import { BotUserDoc } from './botUser';

export interface QuoteGuesserDoc extends Document {
    token: string;
    usedQuotes: QuoteDoc["_id"][];
    currentQuote: QuoteDoc["_id"];
    scores: Map<string, number>;
    answers: Map<string, string>;
    choices: Map<string, string>;
    correctAuthor: [string, string];
    createdAt: Date;
    updatedAt: Date;
}

export interface QuoteGuesserPopulated extends QuoteGuesserDoc {
    usedQuotes: QuoteDoc[];
    currentQuote: QuoteDoc;
}

export interface QuoteGuesserPopulatedCurrentQuote extends QuoteGuesserDoc {
    currentQuote: QuoteDoc;
}

interface QuoteGuesserModel extends Model<QuoteGuesserDoc> { }

const quoteGuesserSchema = new Schema<QuoteGuesserDoc, QuoteGuesserModel>({
    token: { type: String, required: true },
    usedQuotes: [{ type: Schema.Types.ObjectId, ref: 'Quotes', required: true }],
    currentQuote: { type: Schema.Types.ObjectId, ref: 'Quotes', required: true },
    scores: { type: Map, of: Number, required: true },
    answers: { type: Map, of: String, required: true },
    choices: { type: Map, of: String, required: true },
    correctAuthor: { type: [String, String], of: String, required: true }
}, { timestamps: true});

const quoteGuesserModel = model<QuoteGuesserDoc, QuoteGuesserModel>('QuoteGuesser', quoteGuesserSchema);

export async function createQuoteGuesserGame(firstQuote: QuoteDoc, choices: Map<string, string>, correctAuthor: [string, string]): Promise<QuoteGuesserPopulated> {
    debug("Creating quote guesser game")

    const token = generateToken();
    return quoteGuesserModel.create({ token, usedQuotes: [firstQuote], currentQuote: firstQuote, scores: {}, answers: {}, choices, correctAuthor }) as Promise<QuoteGuesserPopulated>;
}

export async function randomQuote(botUser: BotUserDoc, exclude: QuoteDoc['_id'][] = []): Promise<[QuoteDoc?, Map<string, string>?, [string, string]?]> {
    debug(`Getting random quote for bot user ${botUser.id}`);

    const targets = await getAccessableConnections(botUser);

    const query = { _id: { $nin: exclude }, user: { $in: targets }, isConversation: false,  };
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

    const correctAuthor = [encodeURIComponent(quote.authors[0].name), quote.authors[0].name] as [string, string];

    const authorCollections = await quoteModel
        .find({ user: { $in: targets } })
        .populate('authors')
        .select('authors')
        .exec();
    const authors = new Map<string, string>();
    for (const collection of authorCollections) {
        for (const author of collection.authors as DiscordUserDoc[]) {
            const authorUri = encodeURIComponent(author.name);
            if (authorUri === correctAuthor[0]) continue;
            authors.set(authorUri, author.name);
        }
    }

    return [quote, authors, correctAuthor];
}

export default quoteGuesserModel;
