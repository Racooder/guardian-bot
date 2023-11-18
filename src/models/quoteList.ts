import { Model, Schema, Document, model } from "mongoose";
import { Guild } from "./guildSchema";

export interface QuoteList extends Document {
    guild: string;
    page: number;
    content?: string;
    authorId?: string;
    authorName?: string;
    creatorId?: string;
    creatorName?: string;
    date?: Date;
    createdAt: Date;
    updatedAt: Date;
}

interface QuoteListModel extends Model<QuoteList> {}

const quoteListSchema = new Schema<QuoteList, QuoteListModel>(
    {
        guild: {
            type: String,
            ref: "Guild",
            required: true,
        },
        page: {
            type: Number,
            required: true,
        },
        content: {
            type: String,
        },
        authorId: {
            type: String,
        },
        authorName: {
            type: String,
        },
        creatorId: {
            type: String,
        },
        creatorName: {
            type: String,
        },
        date: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const quoteListModel = model<QuoteList, QuoteListModel>("QuoteList", quoteListSchema);

export default quoteListModel;
