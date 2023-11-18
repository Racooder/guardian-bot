import { Model, Schema, Document, model } from "mongoose";
import { GuildSettings } from "./guildSettings";

export interface Guild extends Document {
    _id: string;
    settings: GuildSettings["_id"];
}

interface GuildModel extends Model<Guild> {}

const guildSchema = new Schema<Guild, GuildModel>({
    _id: {
        type: String,
        required: true,
        unique: true,
    },
    settings: {
        type: Schema.Types.ObjectId,
        ref: "GuildSettings",
        required: true,
    },
});

const guildModel = model<Guild, GuildModel>("Guild", guildSchema);

export default guildModel;
