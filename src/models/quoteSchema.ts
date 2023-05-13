import mongoose, { Model, Schema, Document } from "mongoose";
import { IGuildMember } from "./guildMemberSchema";
import { splitArrayIntoChunks } from "../Essentials";

export interface IQuote extends Document {
    guildId: string;
    quote: string;
    timestamp: number;
    author?: IGuildMember["_id"];
    nonDiscordAuthor?: string;
    creator: IGuildMember["_id"];
}

interface QuoteModel extends Model<IQuote> {
    listQuotes: (guildId: string, pageSize: number) => Promise<IQuote[][]>;
}

const quoteSchema = new Schema<IQuote, QuoteModel>({
    guildId: {
        type: String,
        required: true
    },
    quote: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "GuildMember"
    },
    nonDiscordAuthor: {
        type: String
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "GuildMember",
        required: true
    }
});

quoteSchema.static("listQuotes", async function (guildId: string, pageSize: number): Promise<IQuote[][]> {
    const quoteDocuments = await this.find({ guildId: guildId }).populate("author").populate("creator");
    return splitArrayIntoChunks(quoteDocuments, pageSize);
});

export default mongoose.model<IQuote, QuoteModel>("Quote", quoteSchema);
