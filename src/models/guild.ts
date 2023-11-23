import { Model, Schema, Document, model } from "mongoose";
import { IGuildSettings } from "./guildSettings";

export interface IGuild extends Document {
    _id: string;
    settings?: IGuildSettings["_id"];
}

interface GuildModel extends Model<IGuild> {
    update(guildId: string): Promise<IGuild>;
}

const guildSchema = new Schema<IGuild, GuildModel>({
    _id: {
        type: String,
        required: true,
        unique: true,
    },
    settings: {
        type: Schema.Types.ObjectId,
        ref: "GuildSettings",
    },
});

guildSchema.static("update", async function (guildId: string) {
    return this.findByIdAndUpdate(guildId, {}, { upsert: true });
});

const guildModel = model<IGuild, GuildModel>("Guild", guildSchema);

export default guildModel;
