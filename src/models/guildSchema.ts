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

export type LinkedGuild = {
    guildId: string;
    accepted: boolean;
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
    /**
     * Adds a linked guild to a guild.
     * @param guildId - The ID of the guild.
     * @param linkedGuildId - The ID of the linked guild.
     */
    addLinkedGuild: (guildId: string, linkedGuildId: string) => Promise<void>;
    /**
     * Removes a linked guild to a guild.
     * @param guildId - The ID of the guild.
     * @param linkedGuildId - The ID of the linked guild.
     */
    removeLinkedGuild: (guildId: string, linkedGuildId: string) => Promise<void>;
    /**
     * Gets all linked guilds of a guild.
     * @param guildId - The ID of the guild.
     * @returns All linked guilds of the guild.
     */
    listLinkedGuilds: (guildId: string) => Promise<LinkedGuild[]>;
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

export const guildSettings = {
    quoteListPageSize: async (schema: GuildModel, guildId: string): Promise<number> => {
        return (await schema.getGuildSettings(guildId)).quoteListPageSize!.value
    },
    quoteSearchDateTolerance: async (schema: GuildModel, guildId: string): Promise<number> => {
        return (await schema.getGuildSettings(guildId)).quoteSearchDateTolerance!.value
    },
    quoteLinkedGuilds: async (schema: GuildModel, guildId: string): Promise<string[]> => {
        return (await schema.getGuildSettings(guildId)).quoteLinkedGuilds!.value
    },
    quoteGuesserSolutionTimeout: async (schema: GuildModel, guildId: string): Promise<number> => {
        return (await schema.getGuildSettings(guildId)).quoteGuesserSolutionTimeout!.value
    }
}

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
 * Adds a linked guild to a guild.
 * @param guildId - The ID of the guild.
 * @param linkedGuildId - The ID of the linked guild.
 */
guildSchema.statics.addLinkedGuild = async function (guildId: string, linkedGuildId: string): Promise<void> {
    await this.findOneAndUpdate(
        { guildId: guildId },
        { $addToSet: { quoteLinkedGuilds: linkedGuildId } },
        { upsert: true }
    );
}

/**
 * Removes a linked guild to a guild.
 * @param guildId - The ID of the guild.
 * @param linkedGuildId - The ID of the linked guild.
 */
guildSchema.statics.removeLinkedGuild = async function (guildId: string, linkedGuildId: string): Promise<void> {
    await this.findOneAndUpdate(
        { guildId: guildId },
        { $pull: { quoteLinkedGuilds: linkedGuildId } },
        { upsert: true }
    );
}

/**
 * Gets all linked guilds of a guild.
 * @param guildId - The ID of the guild.
 * @returns All linked guilds of the guild.
 */
guildSchema.statics.listLinkedGuilds = async function (guildId: string): Promise<LinkedGuild[]> {
    const guild = await this.findOne({ guildId: guildId });

    if (guild) {
        let linkedGuilds: LinkedGuild[] = [];
        for (const linkedGuildId of guild.quoteLinkedGuilds) {
            const linkedGuild = await this.findOne({ guildId: linkedGuildId });
            let accepted = false;
            if (linkedGuild && linkedGuild.quoteLinkedGuilds.includes(guildId)) {
                accepted = true;
            }

            linkedGuilds.push({
                guildId: linkedGuildId,
                accepted: accepted
            });
        }

        return linkedGuilds;
    } else {
        return [];
    }
}

/**
 * The guild model.
 */
export default mongoose.model<IGuild, GuildModel>("Guild", guildSchema);
