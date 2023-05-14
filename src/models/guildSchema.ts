import mongoose, { Model, Schema, Document } from "mongoose";
import settings from "../settings.json";

export interface IGuild extends Document {
    guildId: string;
    quoteListPageSize: number;
    quoteSearchDateTolerance: number;
    quoteLinkedGuilds: string[];
    quoteGuesserSolutionTimeout: number;
}

export interface IGuildSetting<T> {
    name: string;
    value: T;
    unit?: string;
}

export interface IGuildSettings {
    quoteListPageSize: IGuildSetting<number>;
    quoteSearchDateTolerance: IGuildSetting<number>;
    quoteLinkedGuilds: IGuildSetting<string[]>;
    quoteGuesserSolutionTimeout: IGuildSetting<number>;
}

interface GuildModel extends Model<IGuild> {
    getGuildSettings: (guildId: string) => Promise<IGuildSettings>;
    updateGuildSettings: (guildId: string, settings: IGuildSettings) => Promise<void>;
}

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

guildSchema.statics.getGuildSettings = async function (guildId: string): Promise<IGuildSettings> {
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

guildSchema.statics.updateGuildSettings = async function (guildId: string, settings: IGuildSettings): Promise<void> {
    await this.findOneAndUpdate(
        { guildId: guildId },
        {
            quoteListPageSize: settings.quoteListPageSize.value,
            quoteSearchDateTolerance: settings.quoteSearchDateTolerance.value,
            quoteLinkedGuilds: settings.quoteLinkedGuilds.value
        },
        { upsert: true }
    );
}

export default mongoose.model<IGuild, GuildModel>("Guild", guildSchema);
