import { Document, Model, Schema, model } from 'mongoose';
import { ApiUser } from './apiUser';

export enum BotUserType {
    GUILD = 'guild',
    USER = 'user',
}

export enum QuotePrivacy {
    PUBLIC = 'public',
    PRIVATE = 'private',
    TWO_WAY = 'two-way',
}

export type EmptyBotUser = {
    id: string;
    type: BotUserType;
    name: string;
    memberCount: number;
}

export type BotUserSettings = {
    quote_privacy: QuotePrivacy;
}

export const DEFAULT_BOT_USER_SETTINGS: BotUserSettings = {
    quote_privacy: QuotePrivacy.PRIVATE,
}

export interface BotUser extends Document {
    id: string; // Discord user id or guild id
    type: BotUserType;
    settings: BotUserSettings;
    following: BotUser['_id'][];
    name: string;
    memberCount: number;
    apiUser?: ApiUser['_id'];
}

interface BotUserModel extends Model<BotUser> { }

const botUserSchema = new Schema<BotUser, BotUserModel>({
    id: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
    memberCount: { type: Number, required: true },
    settings: { type: Object, required: true, default: DEFAULT_BOT_USER_SETTINGS },
    following:{ type: [{ type: Schema.Types.ObjectId, ref: 'BotUsers' }], required: true, default: []},
    apiUser: { type: String },
});

const botUserModel = model<BotUser, BotUserModel>('BotUsers', botUserSchema);

export async function updateBotUser(id: string, type: BotUserType, name: string, memberCount: number): Promise<BotUser> {
    const document = await botUserModel.findOne({ id, type });

    if (document === null) {
        return await botUserModel.create({ id, type, name, memberCount });
    }

    document.name = name;
    document.memberCount = memberCount;
    await document.save();
    return document;
}

export default botUserModel;
