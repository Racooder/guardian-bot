import { Model, Schema, Document, model } from "mongoose";

export interface IDiscordUser extends Document {
    _id: string;
    username: string;
    discriminator?: string;
}

interface DiscordUserModel extends Model<IDiscordUser> {
    update(
        userId: string,
        username: string,
        discriminator?: string
    ): Promise<IDiscordUser>;
}

const discordUserSchema = new Schema<IDiscordUser, DiscordUserModel>({
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

discordUserSchema.static("update", async function (userId: string, username: string, discriminator?: string) {
    return this.findByIdAndUpdate(userId, { username, discriminator }, { upsert: true });
});

const discordUserModel = model<IDiscordUser, DiscordUserModel>(
    "DiscordUser",
    discordUserSchema
);

export default discordUserModel;
