import mongoose, { Model, Schema, Document } from "mongoose";
import { IGuildMember } from "./guildMemberSchema";

/**
 * Represents feedback in the database.
 */
export interface IFeedback extends Document {
    type: "bug" | "feature" | "other";
    description: string;
    creator?: IGuildMember["_id"];
    creatorId: string;
    creatorName: string;
}

/**
 * Holds the functions for the feedback schema.
 */
interface FeedbackModel extends Model<IFeedback> {
    /**
     * Lists all feedback.
     * @returns The feedback entries.
     */
    listFeedback: () => Promise<IFeedback[]>;
}

/**
 * The database schema for feedback.
 */
const feedbackSchema = new Schema<IFeedback, FeedbackModel>({
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "GuildMember",
        required: false
    },
    creatorId: {
        type: String,
        required: true
    },
    creatorName: {
        type: String,
        required: true
    }
});

/**
 * Lists feedback.
 * @returns The feedback entries.
 */
feedbackSchema.statics.listFeedback = async function (): Promise<IFeedback[]> {
    return await this.find({});
};

/**
 * The guild model.
 */
export default mongoose.model<IFeedback, FeedbackModel>("Feedback", feedbackSchema);
