import { Document, Model, Schema, model } from 'mongoose';
import { BotUser } from './botUser';
import { DiscordUser } from './discordUser';

export interface Codename extends Document {
    user: BotUser['_id'];
    creator: DiscordUser['_id'];
    word: string;
}

interface CodenameModel extends Model<Codename> { }

const codenameSchema = new Schema<Codename, CodenameModel>({
    user: { type: String, ref: 'BotUser', required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'DiscordUser', required: true },
    word: { type: String, required: true },
});

codenameSchema.index({ user: 1, word: 1 }, { unique: true });

const codenameModel = model<Codename, CodenameModel>('Codename', codenameSchema);

export default codenameModel;
