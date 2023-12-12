import { Document, Model, Schema, model } from 'mongoose';
import { DiscordUser } from './discordUser';

export type FeedbackType = 'bug' | 'feature' | 'other';

export type FeedbackStatus = 'open' | 'closed';

export interface Feedback extends Document {
    creator: DiscordUser['_id'];
    type: FeedbackType;
    description: string;
    status: FeedbackStatus;
}

interface FeedbackModel extends Model<Feedback> { }

const feedbackSchema = new Schema<Feedback, FeedbackModel>({
    creator: { type: Schema.Types.ObjectId, ref: 'DiscordUser', required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true, default: 'open' },
});

const feedbackModel = model<Feedback, FeedbackModel>('Feedback', feedbackSchema);

export default feedbackModel;
