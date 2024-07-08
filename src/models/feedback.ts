import { Document, Model, Schema, model } from 'mongoose';
import { DiscordUserDoc, getOrCreateDiscordUser, getDiscordUserData } from './discordUser';
import { User } from 'discord.js';
import { debug } from '../Log';

export type FeedbackType = 'bug' | 'suggestion' | 'other';

export type FeedbackStatus = 'open' | 'closed';

export interface FeedbackDoc extends Document {
    creator: DiscordUserDoc['_id'];
    type: FeedbackType;
    description: string;
    status: FeedbackStatus;
}

export interface FeedbackPopulated extends FeedbackDoc {
    creator: DiscordUserDoc;
}

interface FeedbackModel extends Model<FeedbackDoc> { }

const feedbackSchema = new Schema<FeedbackDoc, FeedbackModel>({
    creator: { type: Schema.Types.ObjectId, ref: 'DiscordUsers', required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true, default: 'open' },
});

const feedbackModel = model<FeedbackDoc, FeedbackModel>('Feedback', feedbackSchema);

export async function createFeedback(creatorUser: User, type: FeedbackType, description: string): Promise<FeedbackPopulated> {
    debug(`Creating ${type} feedback`);

    const creatorData = getDiscordUserData(creatorUser);
    const creator = await getOrCreateDiscordUser(creatorData.name, creatorData.type, creatorUser.id);
    return await feedbackModel.create({ creator, type, description }) as FeedbackPopulated;
}

export default feedbackModel;
