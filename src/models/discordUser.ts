import { User } from 'discord.js';
import { Document, Model, Schema, model } from 'mongoose';

export type DiscordUserType = 'discord' | 'legacy' | 'non-discord';
export type RawDiscordUser = User | string

export function getDiscordUserData(user: User): { name: string, type: DiscordUserType } {
    const type = user.discriminator === '0' ? 'discord' : 'legacy';
    const name = type === 'discord' ? user.username : `${user.username}#${user.discriminator}`;
    return { name, type };
}

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

discordUserSchema.index({ name: 1, type: 1 }, { unique: true });

const discordUserModel = model<DiscordUser, DiscordUserModel>('DiscordUsers', discordUserSchema);

export async function getOrCreateDiscordUser(username: string, type: DiscordUserType, id?: string): Promise<DiscordUser> {
    let document: DiscordUser | null;
    if (type === 'discord' || type === 'legacy') {
        if (id === undefined) {
            throw new Error('Discord user type requires id');
        }
        document = await discordUserModel.findOne({
            userId: id,
            $or: [
                { type: 'discord' },
                { type: 'legacy' },
            ],
        }).exec();
    } else if (type === 'non-discord') {
        document = await discordUserModel.findOne({ name: username, type: type }).exec();
    } else {
        throw new Error(`Unknown discord user type: ${type}`);
    }

    // Migration from legacy to discord
    if (type == 'discord' && document?.type == 'legacy') {
        document.type = 'discord';
        document.name = username;
        await document.save();
    }

    if (document === null) {
        return await discordUserModel.create({ type: type, userId: id, name: username });
    }
    return document;
}

export default discordUserModel;
