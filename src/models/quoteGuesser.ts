import { Document, Model, Schema, model } from 'mongoose';
import { Dict, generateToken } from '../Essentials';
import { Quote } from './quote';

export interface QuoteGuesserGame extends Document {
    token: string;
    usedQuotes: Quote["_id"][];
    scores: Dict<number>;
    answers: Dict<string>;

    createdAt: Date;
    updatedAt: Date;
}

interface QuoteGuesserModel extends Model<QuoteGuesserGame> { }

const quoteGuesserSchema = new Schema<QuoteGuesserGame, QuoteGuesserModel>({
    token: { type: String, required: true },
    usedQuotes: [{ type: Schema.Types.ObjectId, ref: 'Quotes', required: true }],
    scores: { type: Map, of: Number, required: true },
    answers: { type: Map, of: String, required: true }
}, { timestamps: true});

const quoteGuesserModel = model<QuoteGuesserGame, QuoteGuesserModel>('QuoteGuesser', quoteGuesserSchema);

export async function createQuoteGuesserGame(): Promise<QuoteGuesserGame> {
    const token = generateToken();
    return quoteGuesserModel.create({ token, usedQuotes: [], scores: {}, answers: {} });
}

export default quoteGuesserModel;
