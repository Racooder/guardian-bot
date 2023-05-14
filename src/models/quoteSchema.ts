import mongoose, { Model, Schema, Document } from "mongoose";
import { IGuildMember } from "./guildMemberSchema";
import { approximateEqual, splitArrayIntoChunks } from "../Essentials";
import guildSchema from "./guildSchema";

export interface IQuote extends Document {
    guildId: string;
    quote: string;
    timestamp: number;
    author?: IGuildMember["_id"];
    nonDiscordAuthor?: string;
    creator: IGuildMember["_id"];
    authorName: Promise<string>;
}

export interface IBaseUser {
    id?: string;
    name?: string;
}

interface QuoteModel extends Model<IQuote> {
    listQuotes: (guildId: string, pageSize: number, content?: string, author?: string, authorName?: string, creator?: string, creatorName?: string, date?: Date) => Promise<IQuote[][]>;
    randomQuote: (guildId: string) => Promise<IQuote>;
    allAuthors: (guildId: string) => Promise<IBaseUser[]>;
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
        ref: "GuildMember",
        required: true
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

quoteSchema.virtual("authorName").get(async function(this: IQuote): Promise<string> {
    await this.populate("author");
    if (this.author) {
        return this.author.displayName ?? this.author.username;
    } else if (this.nonDiscordAuthor) {
        return this.nonDiscordAuthor;
    }
    return "Unknown";
})

quoteSchema.statics.listQuotes = async function (guildId: string, pageSize: number, content?: string, author?: string, authorName?: string, creator?: string, creatorName?: string, date?: Date): Promise<IQuote[][]> {
    let quoteDocuments = await this.find({
        guildId: guildId,
    }).populate("author").populate("creator");

    content = content?.toLowerCase();
    authorName = authorName?.toLowerCase();
    creatorName = creatorName?.toLowerCase();
    let timestamp = date?.getTime() ?? 0;
    timestamp = Math.floor(timestamp / 1000);
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

quoteSchema.statics.randomQuote = async function (guildId: string): Promise<IQuote> {
    const quoteDocuments = await this.find({
        guildId: guildId,
    }).populate("author").populate("creator");
    return quoteDocuments[Math.floor(Math.random() * quoteDocuments.length)];
};

quoteSchema.statics.allAuthors = async function (guildId: string): Promise<IBaseUser[]> {
    const quoteDocuments = await this.find({
        guildId: guildId,
    }).populate("author");
    let authors: IBaseUser[] = [];
    for (const quoteDocument of quoteDocuments) {
        if (quoteDocument.author) {
            authors.push({
                id: quoteDocument.author.userId,
                name: quoteDocument.author.displayName ?? quoteDocument.author.username
            });
        } else if (quoteDocument.nonDiscordAuthor) {
            authors.push({
                name: quoteDocument.nonDiscordAuthor
            });
        }
    }
    return authors;
};

export default mongoose.model<IQuote, QuoteModel>("Quote", quoteSchema);
