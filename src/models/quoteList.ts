import { Model, Schema, Document, model } from "mongoose";

export interface IQuoteList extends Document {
    page: number;
    user: string;
    guild?: string;
    content?: string;
    authorId?: string;
    authorName?: string;
    creatorId?: string;
    creatorName?: string;
    date?: Date;
    createdAt: Date;
    updatedAt: Date;
}

interface QuoteListModel extends Model<IQuoteList> {}

const quoteListSchema = new Schema<IQuoteList, QuoteListModel>(
    {
        page: {
            type: Number,
            required: true,
        },
        user: {
            type: String,
            ref: "DiscordUser",
            required: true,
        },
        guild: {
            type: String,
            ref: "Guild",
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

const quoteListModel = model<IQuoteList, QuoteListModel>("QuoteList", quoteListSchema);

export default quoteListModel;
