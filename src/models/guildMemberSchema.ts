import mongoose, { Model, Schema, Document } from "mongoose";

/**
 * Represents a guild member in the database.
 */
export interface IGuildMember extends Document {
    guildId: string;
    userId: string;
    username: string;
    displayName?: string;
    discriminator?: string;
    quoteGuesserScore?: number;
}

/**
 * Holds the functions for the guild member schema.
 */
interface GuildMemberModel extends Model<IGuildMember> {
    /**
     * Updates the username, discriminator and display name of a guild member in the database.
     * @param guildId - The ID of the guild.
     * @param userId - The ID of the user.
     * @param username - The username of the user.
     * @param displayName - The display name of the user.
     * @param discriminator - The discriminator of the user.
     * @returns The updated guild member document.
     */
    updateNames: (guildId: string, userId: string, username: string, discriminator?: string, displayName?: string) => Promise<IGuildMember>;
}

/**
 * The database schema for a guild member.
 */
const guildMemberSchema = new Schema<IGuildMember, GuildMemberModel>({
    guildId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    displayName: {
        type: String
    },
    discriminator: {
        type: String
    },
    quoteGuesserScore: {
        type: Number,
        default: 0
    }
});

/**
 * Updates the username, discriminator and display name of a guild member in the database.
 * @param guildId - The ID of the guild.
 * @param userId - The ID of the user.
 * @param username - The username of the user.
 * @param displayName - The display name of the user.
 * @param discriminator - The discriminator of the user.
 * @returns The updated guild member document.
 */
guildMemberSchema.statics.updateNames = function (guildId: string, userId: string, username: string, displayName?: string, discriminator?: string): Promise<IGuildMember> {
    if (!displayName) displayName = username;
    return this.findOneAndUpdate(
        { guildId, userId },
        { username, displayName, discriminator },
        { upsert: true, new: true }
    );
};

/**
 * The guild member model.
 */
export default mongoose.model<IGuildMember, GuildMemberModel>("GuildMember", guildMemberSchema);
