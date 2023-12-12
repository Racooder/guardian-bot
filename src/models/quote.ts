import { Document, Model, Schema, model } from 'mongoose';
import { BotUser } from './botUser';
import { DiscordUser } from './discordUser';

export interface Quote extends Document {
    user: BotUser['_id'];
    creator: DiscordUser['_id'];
    statements: string[];
    authors: DiscordUser['_id'][];
}

interface QuoteModel extends Model<Quote> { }

const quoteSchema = new Schema<Quote, QuoteModel>({
    user: { type: String, ref: 'BotUser', required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'DiscordUser', required: true },
    statements: { type: [String], required: true },
    authors: [{ type: Schema.Types.ObjectId, ref: 'DiscordUser', required: true }],
});

const quoteModel = model<Quote, QuoteModel>('Quote', quoteSchema);

export default quoteModel;
