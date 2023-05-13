import mongoose, { Model, Schema, Document } from "mongoose";

export interface IQuoteList extends Document {
    page: number;
}

interface QuoteListModel extends Model<IQuoteList> {}

const quoteListSchema = new Schema<IQuoteList, QuoteListModel>({
    page: Number
});

export default mongoose.model<IQuoteList, QuoteListModel>("QuoteList", quoteListSchema);
