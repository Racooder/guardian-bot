import mongoose, { Model, Schema, Document } from "mongoose";
import settings from "../settings.json";

/**
 * Represents a guild in the database.
 */
export interface IGuild extends Document {
    guildId: string;
    quoteListPageSize: number;
    quoteSearchDateTolerance: number;
    quoteLinkedGuilds: string[];
    quoteGuesserSolutionTimeout: number;
}

/**
 * Represents a guild setting value.
 */
export type GuildSetting<T> = {
    name: string;
    value: T;
    unit?: string;
}

/**
 * Represents the settings of a guild.
 */
export type GuildSettings = {
    quoteListPageSize?: GuildSetting<number>;
    quoteSearchDateTolerance?: GuildSetting<number>;
    quoteLinkedGuilds?: GuildSetting<string[]>;
    quoteGuesserSolutionTimeout?: GuildSetting<number>;
}

/**
 * Holds the functions for the guild schema.
 */
interface GuildModel extends Model<IGuild> {
    /**
     * Gets the settings of a guild.
     * @param guildId - The ID of the guild.
     * @returns The settings of the guild or the default settings if the guild does not exist.
     */
    getGuildSettings: (guildId: string) => Promise<GuildSettings>;
    /**
     * Updates the settings of a guild.
     * @param guildId - The ID of the guild.
     * @param settings - The new settings of the guild.
     */
    updateGuildSettings: (guildId: string, settings: GuildSettings) => Promise<void>;
}

/**
 * The database schema for a guild.
 */
const guildSchema = new Schema<IGuild, GuildModel>({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    quoteListPageSize: {
        type: Number,
        required: true,
        default: settings.defaultGuildSettings.quoteListPageSize,
        set: (value: number) => { return Math.floor(value); }
    },
    quoteSearchDateTolerance: {
        type: Number,
        required: true,
        default: settings.defaultGuildSettings.quoteSearchDateTolerance
    },
    quoteLinkedGuilds: {
        type: [String],
        required: true,
        default: settings.defaultGuildSettings.quoteLinkedGuilds
    },
    quoteGuesserSolutionTimeout: {
        type: Number,
        required: true,
        default: settings.defaultGuildSettings.quoteGuesserSolutionTimeout
    }
});

/**
 * Gets the settings of a guild.
 * @param guildId - The ID of the guild.
 * @returns The settings of the guild or the default settings if the guild does not exist.
 */
guildSchema.statics.getGuildSettings = async function (guildId: string): Promise<GuildSettings> {
    const guild = await this.findOne({ guildId: guildId });
    if (guild) {
        return {
            quoteListPageSize: {
                name: "Quote List Page Size (number)",
                value: guild.quoteListPageSize || settings.defaultGuildSettings.quoteListPageSize,
                unit: "pages"
            },
            quoteSearchDateTolerance: {
                name: "Quote Search Date Tolerance (number)",
                value: guild.quoteSearchDateTolerance || settings.defaultGuildSettings.quoteSearchDateTolerance,
                unit: "days"
            },
            quoteLinkedGuilds: {
                name: "Quote Linked Guilds (array of guild IDs)",
                value: guild.quoteLinkedGuilds || settings.defaultGuildSettings.quoteLinkedGuilds
            },
            quoteGuesserSolutionTimeout: {
                name: "Quote Guesser Solution Timeout (number)",
                value: guild.quoteGuesserSolutionTimeout || settings.defaultGuildSettings.quoteGuesserSolutionTimeout,
                unit: "seconds"
            }
        }
    } else {
        return {
            quoteListPageSize: {
                name: "Quote List Page Size (number)",
                value: settings.defaultGuildSettings.quoteListPageSize,
                unit: "pages"
            },
            quoteSearchDateTolerance: {
                name: "Quote Search Date Tolerance (number)",
                value: settings.defaultGuildSettings.quoteSearchDateTolerance,
                unit: "days"
            },
            quoteLinkedGuilds: {
                name: "Quote Linked Guilds (array of guild IDs)",
                value: settings.defaultGuildSettings.quoteLinkedGuilds
            },
            quoteGuesserSolutionTimeout: {
                name: "Quote Guesser Solution Timeout (number)",
                value: settings.defaultGuildSettings.quoteGuesserSolutionTimeout,
                unit: "seconds"
            }
        }
    }
}

/**
 * Updates the settings of a guild.
 * @param guildId - The ID of the guild.
 * @param settings - The new settings of the guild.
 */
guildSchema.statics.updateGuildSettings = async function (guildId: string, settings: GuildSettings): Promise<void> {
    await this.findOneAndUpdate(
        { guildId: guildId },
        {
            quoteListPageSize: settings.quoteListPageSize?.value,
            quoteSearchDateTolerance: settings.quoteSearchDateTolerance?.value,
            quoteLinkedGuilds: settings.quoteLinkedGuilds?.value
        },
        { upsert: true }
    );
}

/**
 * The guild model.
 */
export default mongoose.model<IGuild, GuildModel>("Guild", guildSchema);
