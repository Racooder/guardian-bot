import { Document, Model, Schema, model } from 'mongoose';
import { BotUser } from './botUser';

type ApiPermission = {
    permission: string;
    environment?: BotUser;
}

export interface ApiUser extends Document {
    token: string;
    permissions: ApiPermission[];
}

interface ApiUserModel extends Model<ApiUser> { }

const apiUserSchema = new Schema<ApiUser, ApiUserModel>({
    token: { type: String, required: true, unique: true },
    permissions: { type: [Object], required: true},
});

const apiUserModel = model<ApiUser, ApiUserModel>('ApiUsers', apiUserSchema);

export default apiUserModel;
