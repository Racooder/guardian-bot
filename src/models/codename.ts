import { Document, Model, Schema, model } from 'mongoose';
import { BotUser } from './botUser';
import { DiscordUser, getDiscordUserData, getOrCreateDiscordUser } from './discordUser';
import { User } from 'discord.js';
import { debug } from '../Log';
import { getAccessableConnections } from '../Essentials';

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

export async function getWords(botUser: BotUser): Promise<Codename[]> {
    debug(`Getting codenames words for bot user ${botUser.name}`);

    const targets = await getAccessableConnections(botUser);

    return await codenameModel.find({ user: { $in: targets } });
}

export async function getWord(botUser: BotUser, word: string): Promise<Codename | null> {
    debug(`Getting codename word ${word} for bot user ${botUser.name}`);

    const targets = await getAccessableConnections(botUser);

    const document = await codenameModel.findOne({ user: { $in: targets }, word });
    if (!document) {
        return null;
    }
    return document.populate('creator');
}

export async function addWord(botUser: BotUser, creatorUser: User, word: string): Promise<Codename | undefined> {
    debug(`Adding codename word ${word} for bot user ${botUser.name}`);

    const creatorData = getDiscordUserData(creatorUser);
    const creator = await getOrCreateDiscordUser(creatorData.name, creatorData.type, creatorUser.id);
    const existing = await codenameModel.findOne({ user: botUser._id, word });
    if (existing) {
        return undefined;
    }
    return await codenameModel.create({ user: botUser._id, creator: creator._id, word });
}

export async function removeWord(botUser: BotUser, word: string) : Promise<boolean> {
    debug(`Removing codename word ${word} for bot user ${botUser.name}`);

    const document = await codenameModel.findOne({ user: botUser._id, word }).populate('creator');
    if (!document) {
        return false;
    }
    await codenameModel.deleteOne({ user: botUser._id, word });
    return true;
}

export default codenameModel;
