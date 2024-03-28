import { Document, Model, Schema, model } from 'mongoose';
import { BotUser, getOrCreateBotUser } from './botUser';
import { DiscordUser, getDiscordUserData, getOrCreateDiscordUser } from './discordUser';
import { User } from 'discord.js';

export interface Codename extends Document {
    user: BotUser['_id'];
    creator: DiscordUser['_id'];
    word: string;
}

interface CodenameModel extends Model<Codename> { }

const codenameSchema = new Schema<Codename, CodenameModel>({
    user: { type: Schema.Types.ObjectId, ref: 'BotUsers', required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'DiscordUsers', required: true },
    word: { type: String, required: true },
});

codenameSchema.index({ user: 1, word: 1 }, { unique: true });

const codenameModel = model<Codename, CodenameModel>('Codenames', codenameSchema);

export async function getWords(userId: string): Promise<Codename[]> {
    const botUser = await getOrCreateBotUser(userId);
    return await codenameModel.find({ user: botUser._id });
}

export async function getWord(userId: string, word: string): Promise<Codename | null> {
    const botUser = await getOrCreateBotUser(userId);
    const document = await codenameModel.findOne({ user: botUser._id, word });
    if (!document) {
        return null;
    }
    return document.populate('creator');
}

export async function addWord(userId: string, creatorUser: User, word: string): Promise<Codename | undefined> {
    const botUser = await getOrCreateBotUser(userId);
    const creatorData = getDiscordUserData(creatorUser);
    const creator = await getOrCreateDiscordUser(creatorData.name, creatorData.type, creatorUser.id);
    const existing = await codenameModel.findOne({ user: botUser._id, word });
    if (existing) {
        return undefined;
    }
    return await codenameModel.create({ user: botUser._id, creator: creator._id, word });
}

export async function removeWord(userId: string, word: string) : Promise<boolean> {
    const botUser = await getOrCreateBotUser(userId);
    const document = await codenameModel.findOne({ user: botUser._id, word }).populate('creator');
    if (!document) {
        return false;
    }
    await codenameModel.deleteOne({ user: botUser._id, word });
    return true;
}

export default codenameModel;
