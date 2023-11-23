import { Model, Schema, Document, model } from "mongoose";

export interface IGuildSettings extends Document {
    guild: string;
    quoteLinkedGuilds: string[];
    quoteListPageSize: number;
    quoteSearchDateTolerance: number;
    quoteGuesserSolutionTimeout: number;

    // Virtuals
    addLinkedGuild(guild: string): Promise<IGuildSettings>;
    removeLinkedGuild(guild: string): Promise<IGuildSettings>;
}

interface GuildSettingsModel extends Model<IGuildSettings> {
    update(
        guild: string,
        quoteLinkedGuilds: string[],
        quoteListPageSize: number,
        quoteSearchDateTolerance: number,
        quoteGuesserSolutionTimeout: number
    ): Promise<IGuildSettings>;
}

const guildSettingsSchema = new Schema<IGuildSettings, GuildSettingsModel>({
    guild: {
        type: String,
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

guildSettingsSchema.virtual("addLinkedGuild").get(async function (this: IGuildSettings) {
    return this.updateOne({ $addToSet: { quoteLinkedGuilds: this.guild } });
});

guildSettingsSchema.virtual("removeLinkedGuild").get(async function (this: IGuildSettings) {
    return this.updateOne({ $pull: { quoteLinkedGuilds: this.guild } });
});

guildSettingsSchema.static("update", async function (
    guild: string,
    quoteListPageSize: number,
    quoteSearchDateTolerance: number,
    quoteGuesserSolutionTimeout: number
) {
    return this.findOneAndUpdate(
        { guild },
        {
            quoteListPageSize,
            quoteSearchDateTolerance,
            quoteGuesserSolutionTimeout,
        },
        { upsert: true }
    );
});

const guildSettingsModel = model<IGuildSettings, GuildSettingsModel>(
    "GuildSettings",
    guildSettingsSchema
);

export default guildSettingsModel;
