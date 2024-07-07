import { Document, Model, Schema, model } from 'mongoose';
import { BotUser } from './botUser';

export interface FollowMenu extends Document {
    targets: BotUser['_id'][];
    extendedSearch: boolean;

    createdAt: Date;
    updatedAt: Date;
}

interface FollowMenuModel extends Model<FollowMenu> { }

const followMenuSchema = new Schema<FollowMenu, FollowMenuModel>({
    targets: { type: [{ type: Schema.Types.ObjectId, ref: 'BotUsers' }], required: true, default: [] },
    extendedSearch: { type: Boolean, required: true },
}, { timestamps: true });

const followMenuModel = model<FollowMenu, FollowMenuModel>('FollowMenus', followMenuSchema);

export default followMenuModel;
