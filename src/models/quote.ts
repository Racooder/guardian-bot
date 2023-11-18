import { Model, Schema, Document, model } from "mongoose";
import { PotentialGuildMember } from "./potentialGuildMember";
import { QuoteUser } from "./quoteUser";

export interface Quote extends Document {
    guild: string;
    creator: PotentialGuildMember["_id"];
    authors: QuoteUser["_id"][];
    quotes: string[];
    createdAt: Date;
    updatedAt: Date;
}

interface QuoteModel extends Model<Quote> {}

const quoteSchema = new Schema<Quote, QuoteModel>(
    {
        guild: {
            type: String,
            ref: "Guild",
            required: true,
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: "PotentialGuildMember",
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

const quoteModel = model<Quote, QuoteModel>("Quote", quoteSchema);

export default quoteModel;
