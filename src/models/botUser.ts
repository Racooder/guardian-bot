import { Document, Model, Schema, model } from 'mongoose';
import { ApiUser } from './apiUser';

export type BotUserSettings = {
    quoteListPageSize: number;
}

export interface BotUser extends Document {
    _id: string; // Discord user id or guild id
    settings: BotUserSettings;
    apiUser?: ApiUser['_id'];
}

interface BotUserModel extends Model<BotUser> { }

const botUserSchema = new Schema<BotUser, BotUserModel>({
    _id: { type: String, required: true, unique: true },
    settings: { type: Object, required: true },
    apiUser: { type: String },
});

const botUserModel = model<BotUser, BotUserModel>('BotUser', botUserSchema);

export default botUserModel;
