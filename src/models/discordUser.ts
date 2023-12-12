import { Document, Model, Schema, model } from 'mongoose';

export type DiscordUserType = 'discord' | 'legacy' | 'non-discord';

export interface DiscordUser extends Document {
    name: string; // username, username#discriminator, or non discord name
    type: DiscordUserType;
    userId?: string;
}

interface DiscordUserModel extends Model<DiscordUser> { }

const discordUserSchema = new Schema<DiscordUser, DiscordUserModel>({
    type: { type: String, required: true },
    name: { type: String, required: true },
    userId: { type: String },
});

discordUserSchema.index({ username: 1, type: 1 }, { unique: true });

const discordUserModel = model<DiscordUser, DiscordUserModel>('DiscordUser', discordUserSchema);

export default discordUserModel;
