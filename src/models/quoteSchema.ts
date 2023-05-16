import mongoose, { Model, Schema, Document } from "mongoose";
import { IGuildMember } from "./guildMemberSchema";
import { approximateEqual, splitArrayIntoChunks } from "../Essentials";
import guildSchema, { guildSettings } from "./guildSchema";

/**
 * Represents a quote in the database.
 */
export interface IQuote extends Document {
    guildId: string;
    quote: string;
    timestamp: number;
    author?: IGuildMember["_id"];
    nonDiscordAuthor?: string;
    creator: IGuildMember["_id"];
    /**
     * Gets the name of the author of the quote.
     * @returns The displayName or username of the author, the nonDiscordAuthor or "Unknown" if none of those are available.
     */
    authorName: Promise<string>;
}

/**
 * Represents a very basic user.
 * This is used for function returns where only the user's ID and name are needed.
 */
export type BaseUser = {
    id?: string;
    name?: string;
}

/**
 * Holds the functions for the quote schema.
 */
interface QuoteModel extends Model<IQuote> {
    /**
     * Lists all quotes that match the given parameters.
     * @param guildId - The ID of the guild to search in.
     * @param pageSize - The number of quotes to return per page.
     * @param content - The content to search for.
     * @param author - The ID of the author to search for.
     * @param authorName - The name of the author or the nonDiscordAuthor to search for.
     * @param creator - The ID of the creator to search for.
     * @param creatorName - The name of the creator to search for.
     * @param date - The date to search for.
     * @returns The quotes that match the given parameters, split into pages.
     */
    listQuotes: (guildId: string, pageSize: number, content?: string, author?: string, authorName?: string, creator?: string, creatorName?: string, date?: Date) => Promise<IQuote[][]>;
    /**
     * Returns a random quote from a guild.
     * @param guildId - The ID of the guild to get the quote from.
     * @returns The random quote.
     */
    randomQuote: (guildId: string) => Promise<IQuote>;
    /**
     * Returns all authors of quotes in a guild.
     * @param guildId - The ID of the guild to get the authors from.
     * @returns The authors of the quotes.
     */
    allAuthors: (guildId: string) => Promise<BaseUser[]>;
}

/**
 * The database schema for a quote.
 */
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

/**
 * Gets the name of the author of the quote.
 * @returns The displayName or username of the author, the nonDiscordAuthor or "Unknown" if none of those are available.
 */
quoteSchema.virtual("authorName").get(async function(this: IQuote): Promise<string> {
    await this.populate("author");
    if (this.author) {
        return this.author.displayName ?? this.author.username;
    } else if (this.nonDiscordAuthor) {
        return this.nonDiscordAuthor;
    }
    return "Unknown";
})

/**
 * Lists all quotes that match the given parameters.
 * @param guildId - The ID of the guild to search in.
 * @param pageSize - The number of quotes to return per page.
 * @param content - The content to search for.
 * @param author - The ID of the author to search for.
 * @param authorName - The name of the author or the nonDiscordAuthor to search for.
 * @param creator - The ID of the creator to search for.
 * @param creatorName - The name of the creator to search for.
 * @param date - The date to search for.
 * @returns The quotes that match the given parameters, split into pages.
 */
quoteSchema.statics.listQuotes = async function (guildId: string, pageSize: number, content?: string, author?: string, authorName?: string, creator?: string, creatorName?: string, date?: Date): Promise<IQuote[][]> {
    // Get all quotes from the guild
    let quoteDocuments = await this.find({
        guildId: guildId,
    }).populate("author").populate("creator");

    // Prepare the parameters
    content = content?.toLowerCase();
    authorName = authorName?.toLowerCase();
    creatorName = creatorName?.toLowerCase();
    let timestamp = date?.getTime() ?? 0;
    timestamp = Math.floor(timestamp / 1000);
    const dateTolerance = await guildSettings.quoteSearchDateTolerance(guildSchema, guildId)

    // Filter the quotes
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

/**
 * Returns a random quote from a guild.
 * @param guildId - The ID of the guild to get the quote from.
 * @returns The random quote.
 */
quoteSchema.statics.randomQuote = async function (guildId: string): Promise<IQuote> {
    const quoteDocuments = await this.find({
        guildId: guildId,
    }).populate("author").populate("creator");
    return quoteDocuments[Math.floor(Math.random() * quoteDocuments.length)];
};

/**
 * Returns all authors of quotes in a guild.
 * @param guildId - The ID of the guild to get the authors from.
 * @returns The authors of the quotes.
 */
quoteSchema.statics.allAuthors = async function (guildId: string): Promise<BaseUser[]> {
    // Get all quotes from the guild
    const quoteDocuments = await this.find({
        guildId: guildId,
    }).populate("author");

    // Get all unique authors
    let authorMap: Map<string, BaseUser> = new Map();
    for (const quoteDocument of quoteDocuments) {
        if (quoteDocument.author) {
            authorMap.set(quoteDocument.author.userId, {
                id: quoteDocument.author.userId,
                name: quoteDocument.author.displayName ?? quoteDocument.author.username
            });
        } else if (quoteDocument.nonDiscordAuthor) {
            authorMap.set(quoteDocument.nonDiscordAuthor, {
                name: quoteDocument.nonDiscordAuthor
            });
        }
    }
    
    return Array.from(authorMap.values());
};

/**
 * The quote model.
 */
export default mongoose.model<IQuote, QuoteModel>("Quote", quoteSchema);
