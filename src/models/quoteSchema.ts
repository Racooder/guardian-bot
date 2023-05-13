import mongoose, { Model, Schema, Document } from "mongoose";
import { IGuildMember } from "./guildMemberSchema";
import { approximateEqual, splitArrayIntoChunks } from "../Essentials";
import settings from "../settings.json";
import guildSchema from "./guildSchema";

export interface IQuote extends Document {
    guildId: string;
    quote: string;
    timestamp: number;
    author?: IGuildMember["_id"];
    nonDiscordAuthor?: string;
    creator: IGuildMember["_id"];
}

interface QuoteModel extends Model<IQuote> {
    listQuotes: (guildId: string, pageSize: number, content?: string, author?: string, authorName?: string, creator?: string, creatorName?: string, date?: Date) => Promise<IQuote[][]>;
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

quoteSchema.statics.listQuotes = async function (guildId: string, pageSize: number, content?: string, author?: string, authorName?: string, creator?: string, creatorName?: string, date?: Date): Promise<IQuote[][]> {
    let quoteDocuments = await this.find({
        guildId: guildId,
    }).populate("author").populate("creator");

    content = content?.toLowerCase();
    authorName = authorName?.toLowerCase();
    creatorName = creatorName?.toLowerCase();
    let timestamp = date?.getTime() ?? 0;
    timestamp = Math.round(timestamp / 1000);
    const dateTolerance = (await guildSchema.getGuildSettings(guildId)).quoteSearchDateTolerance.value

    quoteDocuments = quoteDocuments.filter((quoteDocument) => {
        return (content === undefined || quoteDocument.quote.toLowerCase().includes(content)) &&
        (author === undefined || quoteDocument.author?.userId === author) &&
        (authorName === undefined || quoteDocument.author?.username.toLowerCase() === authorName || quoteDocument.author?.displayName.toLowerCase() === authorName || quoteDocument.nonDiscordAuthor?.toLowerCase() === authorName) &&
        (creator === undefined || quoteDocument.creator.userId === creator) &&
        (creatorName === undefined || quoteDocument.creator.username.toLowerCase() === creatorName || quoteDocument.creator.displayName.toLowerCase() === creatorName) &&
        (timestamp === 0 || approximateEqual(quoteDocument.timestamp, timestamp, 60 * 60 * 24 * dateTolerance));
    });

    return splitArrayIntoChunks(quoteDocuments, pageSize);
};

export default mongoose.model<IQuote, QuoteModel>("Quote", quoteSchema);
