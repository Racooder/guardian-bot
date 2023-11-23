import { Model, Schema, Document, model } from "mongoose";
import { IQuoteUser } from "./quoteUser";
import { IGuildMember } from "./guildMember";

export interface IQuote extends Document {
    guild: string;
    creator: IGuildMember["_id"];
    authors: IQuoteUser["_id"][];
    quotes: string[];
    createdAt: Date;
    updatedAt: Date;
}

interface QuoteModel extends Model<IQuote> {}

const quoteSchema = new Schema<IQuote, QuoteModel>(
    {
        guild: {
            type: String,
            ref: "Guild",
            required: true,
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: "GuildMember",
            required: true,
        },
        authors: [
            {
                type: Schema.Types.ObjectId,
                ref: "QuoteUser",
                required: true,
            },
        ],
        quotes: [
            {
                type: String,
                required: true,
            },
        ],
    },
    {
        timestamps: true,
    }
);

const quoteModel = model<IQuote, QuoteModel>("Quote", quoteSchema);

export default quoteModel;
