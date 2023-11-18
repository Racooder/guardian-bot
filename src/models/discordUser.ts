import { Model, Schema, Document, model } from "mongoose";

export interface DiscordUser extends Document {
    _id: string;
    username: string;
    discriminator?: string;
}

interface DiscordUserModel extends Model<DiscordUser> {}

const discordUserSchema = new Schema<DiscordUser, DiscordUserModel>({
    _id: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    discriminator: {
        type: String,
    },
});

const discordUserModel = model<DiscordUser, DiscordUserModel>(
    "DiscordUser",
    discordUserSchema
);

export default discordUserModel;
