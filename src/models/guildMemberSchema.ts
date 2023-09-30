import { GuildMember, User } from "discord.js";
import mongoose, { Model, Schema, Document } from "mongoose";
import { getBaseUser } from "../Essentials";

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
     * @param user - The user or member object.
     * @returns The updated guild member document.
     */
    updateNames: (
        guildId: string,
        user: User | GuildMember
    ) => Promise<IGuildMember>;
}

/**
 * The database schema for a guild member.
 */
const guildMemberSchema = new Schema<IGuildMember, GuildMemberModel>({
    guildId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
    },
    discriminator: {
        type: String,
    },
    quoteGuesserScore: {
        type: Number,
        default: 0,
    },
});

/**
 * Updates the username, discriminator and display name of a guild member in the database.
 * @param guildId - The ID of the guild.
 * @param user - The user or member object.
 * @returns The updated guild member document.
 */
guildMemberSchema.statics.updateNames = function (
    guildId: string,
    user: User | GuildMember
): Promise<IGuildMember> {
    const userId = user.id;

    const baseUser = getBaseUser(user);
    const username = baseUser.username;
    const discriminator = baseUser.discriminator;

    let displayName =
        user instanceof GuildMember ? user.displayName : undefined;

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
export default mongoose.model<IGuildMember, GuildMemberModel>(
    "GuildMember",
    guildMemberSchema
);
