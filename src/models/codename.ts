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
    word_lower: string;
}

interface CodenameModel extends Model<Codename> { }

const codenameSchema = new Schema<Codename, CodenameModel>({
    user: { type: Schema.Types.ObjectId, ref: 'BotUsers', required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'DiscordUsers', required: true },
    word: { type: String, required: true },
    word_lower: { type: String, required: true },
});

codenameSchema.index({ user: 1, word: 1 }, { unique: true });

const codenameModel = model<Codename, CodenameModel>('Codenames', codenameSchema);

export async function getWords(botUser: BotUser): Promise<Codename[]> {
    debug(`Getting codenames words for bot user ${botUser.name}`);

    const targets = await getAccessableConnections(botUser);

    return await codenameModel.find({ user: { $in: targets } });
}

export enum RemoveWordResult {
    Success,
    NotFound,
    NotCreator
}

export async function removeWord(botUser: BotUser, word: string, inGuild: boolean, remover: User): Promise<RemoveWordResult> {
    debug(`Getting codename word ${word} for bot user ${botUser.name}`);
    const targets = await getAccessableConnections(botUser);
    const documents = await codenameModel.find({ user: { $in: targets }, word_lower: word.toLowerCase() }).populate('creator');
    if (documents.length === 0) {
        return RemoveWordResult.NotFound;
    }

    let deleted = RemoveWordResult.NotCreator;
    for (const document of documents) {
        if (!inGuild) {
            codenameModel.findByIdAndDelete(document._id).exec();
            deleted = RemoveWordResult.Success;
        } else if (document.creator.userId === remover.id){
            codenameModel.findByIdAndDelete(document._id).exec();
            deleted = RemoveWordResult.Success;
        }
    }

    return deleted;
}

export async function addWord(botUser: BotUser, creatorUser: User, word: string): Promise<Codename | undefined> {
    debug(`Adding codename word ${word} for bot user ${botUser.name}`);

    const creatorData = getDiscordUserData(creatorUser);
    const creator = await getOrCreateDiscordUser(creatorData.name, creatorData.type, creatorUser.id);
    const word_lower = word.toLowerCase();
    const existing = await codenameModel.findOne({ user: botUser._id, word_lower });
    if (existing) {
        return undefined;
    }
    return await codenameModel.create({ user: botUser._id, creator: creator._id, word, word_lower });
}

export default codenameModel;
