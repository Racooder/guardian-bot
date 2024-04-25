import { Document, Model, Schema, model } from 'mongoose';
import { Dict, generateToken } from '../Essentials';
import { Quote } from './quote';
import { debug } from '../Log';

export interface QuoteGuesserGame extends Document {
    token: string;
    usedQuotes: Quote["_id"][];
    currentQuote: Quote["_id"];
    scores: Map<string, number>;
    answers: Map<string, string>;
    choices: Map<string, string>;
    correctAuthor: [string, string];

    createdAt: Date;
    updatedAt: Date;
}

interface QuoteGuesserModel extends Model<QuoteGuesserGame> { }

const quoteGuesserSchema = new Schema<QuoteGuesserGame, QuoteGuesserModel>({
    token: { type: String, required: true },
    usedQuotes: [{ type: Schema.Types.ObjectId, ref: 'Quotes', required: true }],
    currentQuote: { type: Schema.Types.ObjectId, ref: 'Quotes', required: true },
    scores: { type: Map, of: Number, required: true },
    answers: { type: Map, of: String, required: true },
    choices: { type: Map, of: String, required: true },
    correctAuthor: { type: [String, String], of: String, required: true }
}, { timestamps: true});

const quoteGuesserModel = model<QuoteGuesserGame, QuoteGuesserModel>('QuoteGuesser', quoteGuesserSchema);

export async function createQuoteGuesserGame(firstQuote: Quote, choices: Map<string, string>, correctAuthor: [string, string]): Promise<QuoteGuesserGame> {
    debug("Creating quote guesser game")

    const token = generateToken();
    return quoteGuesserModel.create({ token, usedQuotes: [firstQuote._id], currentQuote: firstQuote._id, scores: {}, answers: {}, choices, correctAuthor });
}

export default quoteGuesserModel;
