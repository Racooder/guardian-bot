import mongoose, { Model, Schema, Document } from "mongoose";
import { IGuildMember } from "./guildMemberSchema";

/**
 * Represents a codenames word in the database.
 */
export interface ICodenames extends Document {
    guildId: string;
    word: string;
    creator: IGuildMember["_id"];
}

/**
 * Holds the functions for the codenames schema.
 */
interface CodenamesModel extends Model<ICodenames> {
    /**
     * Lists all quotes that match the given parameters.
     * @param guildId - The ID of the guild to search in.
     * @returns The codenames words of the given guild.
     */
    listQuotes: (guildId: string) => Promise<String[]>;
}

/**
 * The database schema for a codenames word.
 */
const codenamesSchema = new Schema<ICodenames, CodenamesModel>({
    guildId: {
        type: String,
        required: true
    },
    word: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "GuildMember",
        required: true
    },
});

codenamesSchema.index({ guildId: 1, word: 1 }, { unique: true }); // Make sure that the same word can't be added twice

/**
 * Lists all quotes that match the given parameters.
 * @param guildId - The ID of the guild to search in.
 * @returns The codenames words of the given guild.
 */
codenamesSchema.statics.listQuotes = async function (guildId: String): Promise<String[]> {
    // Get all quotes from the guild
    let codenamesDocuments = await this.find({
        guildId: guildId,
    });

    return codenamesDocuments.map((codenamesDocument) => {
        return codenamesDocument.word;
    });
};

/**
 * The guild model.
 */
export default mongoose.model<ICodenames, CodenamesModel>("Codenames", codenamesSchema);
