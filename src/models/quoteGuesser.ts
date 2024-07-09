import { Document, Model, Schema, model } from 'mongoose';
import { generateToken } from '../Essentials';
import { QuoteDoc } from './quote';
import { debug } from '../Log';

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

export default quoteGuesserModel;
