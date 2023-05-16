import mongoose, { Model, Schema, Document } from "mongoose";
import settings from "../settings.json";

/**
 * Represents a quote list in the database.
 */
export interface IQuoteList extends Document {
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

/**
 * Holds the functions for the quote list schema.
 */
interface QuoteListModel extends Model<IQuoteList> {
    /**
     * Clears all quote lists that are older than the quote list lifetime.
     */
    clearOld: () => Promise<void>;
}

/**
 * The database schema for a quote list.
 */
const quoteListSchema = new Schema<IQuoteList, QuoteListModel>({
    page: {
        type: Number,
        required: true
    },
    content: {
        type: String
    },
    authorId: {
        type: String
    },
    authorName: {
        type: String
    },
    creatorId: {
        type: String
    },
    creatorName: {
        type: String
    },
    date: {
        type: Date
    },
}, {
    timestamps: true
});

/**
 * Clears all quote lists that are older than the quote list lifetime.
 */
quoteListSchema.statics.clearOld = async function (): Promise<void> {
    const now = new Date();
    const old = new Date(now.getTime() - 1000 * 60 * 60 * 24 * settings.quoteListLifetime);
    
    const quoteListDocuments = await this.find({});

    const oldQuoteListDocuments = quoteListDocuments.filter((quoteListDocument) => {
        return quoteListDocument.updatedAt < old;
    });

    for (const oldQuoteListDocument of oldQuoteListDocuments) {
        await oldQuoteListDocument.deleteOne();
    }
};

/**
 * The quote list model.
 */
export default mongoose.model<IQuoteList, QuoteListModel>("QuoteList", quoteListSchema);
