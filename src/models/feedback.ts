import { Document, Model, Schema, model } from 'mongoose';
import { DiscordUser, getOrCreateDiscordUser, getDiscordUserData } from './discordUser';
import { User } from 'discord.js';
import { debug } from '../Log';

export type FeedbackType = 'bug' | 'suggestion' | 'other';

export type FeedbackStatus = 'open' | 'closed';

export interface Feedback extends Document {
    creator: DiscordUser['_id'];
    type: FeedbackType;
    description: string;
    status: FeedbackStatus;
}

interface FeedbackModel extends Model<Feedback> { }

const feedbackSchema = new Schema<Feedback, FeedbackModel>({
    creator: { type: Schema.Types.ObjectId, ref: 'DiscordUsers', required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true, default: 'open' },
});

const feedbackModel = model<Feedback, FeedbackModel>('Feedback', feedbackSchema);

export async function createFeedback(creatorUser: User, type: FeedbackType, description: string): Promise<Feedback> {
    debug(`Creating ${type} feedback`);

    const creatorData = getDiscordUserData(creatorUser);
    const creator = await getOrCreateDiscordUser(creatorData.name, creatorData.type, creatorUser.id);
    return await feedbackModel.create({ creator: creator._id, type, description });
}

export default feedbackModel;
