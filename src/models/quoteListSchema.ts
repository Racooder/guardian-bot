import mongoose, { Model, Schema, Document } from "mongoose";
import settings from "../settings.json";

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

interface QuoteListModel extends Model<IQuoteList> {
    clearOld: () => Promise<void>;
}

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

export default mongoose.model<IQuoteList, QuoteListModel>("QuoteList", quoteListSchema);
