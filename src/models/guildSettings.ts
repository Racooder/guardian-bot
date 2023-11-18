import { Model, Schema, Document, model } from "mongoose";
import { Guild } from "./guildSchema";

export interface GuildSettings extends Document {
    guild: string;
    quoteLinkedGuilds: string[];
    quoteListPageSize: number;
    quoteSearchDateTolerance: number;
    quoteGuesserSolutionTimeout: number;
}

interface GuildSettingsModel extends Model<GuildSettings> {}

const guildSettingsSchema = new Schema<GuildSettings, GuildSettingsModel>({
    guild: {
        type: Schema.Types.String,
        ref: "Guild",
        required: true,
        unique: true,
    },
    quoteLinkedGuilds: [
        {
            type: String,
            ref: "Guild",
            required: true,
        },
    ],
    quoteListPageSize: {
        type: Number,
        required: true,
    },
    quoteSearchDateTolerance: {
        type: Number,
        required: true,
    },
    quoteGuesserSolutionTimeout: {
        type: Number,
        required: true,
    },
});

const guildSettingsModel = model<GuildSettings, GuildSettingsModel>(
    "GuildSettings",
    guildSettingsSchema
);

export default guildSettingsModel;
