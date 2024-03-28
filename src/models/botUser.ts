import { Document, Model, Schema, model } from 'mongoose';
import { ApiUser } from './apiUser';

const DEFAULT_USER_SETTINGS: BotUserSettings = { };

export type BotUserSettings = { }

export interface BotUser extends Document {
    id: string; // Discord user id or guild id
    settings: BotUserSettings;
    apiUser?: ApiUser['_id'];
}

interface BotUserModel extends Model<BotUser> { }

const botUserSchema = new Schema<BotUser, BotUserModel>({
    id: { type: String, required: true, unique: true },
    settings: { type: Object, required: true, default: DEFAULT_USER_SETTINGS },
    apiUser: { type: String },
});

const botUserModel = model<BotUser, BotUserModel>('BotUsers', botUserSchema);

export async function getOrCreateBotUser(id: string): Promise<BotUser> {
    const document = await botUserModel.findOne({ id }).exec();
    if (document === null) {
        return await botUserModel.create({ id });
    }
    return document;
}

export default botUserModel;
