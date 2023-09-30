import mongoose, { Model, Schema, Document } from "mongoose";
import { IGuildMember } from "./guildMemberSchema";

export interface APIFeedback {
    type: "bug" | "feature" | "other";
    description: string;
    creatorId?: string;
    creatorName: string;
}

/**
 * Represents feedback in the database.
 */
export interface IFeedback extends Document {
    type: "bug" | "feature" | "other";
    description: string;
    creator?: IGuildMember["_id"];
    creatorId?: string;
    creatorName: string;
    createdAt: Date;
    updatedAt: Date;
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
    /**
     * Gets all feedback entries between the given dates or all if no dates are given.
     * @param from - The start date.
     * @param to - The end date.
     * @returns The feedback entries.
     */
    getAll: (from?: Date, to?: Date) => Promise<APIFeedback[]>;
}

/**
 * The database schema for feedback.
 */
const feedbackSchema = new Schema<IFeedback, FeedbackModel>(
    {
        type: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: "GuildMember",
            required: false,
        },
        creatorId: {
            type: String,
            required: true,
        },
        creatorName: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Lists feedback.
 * @returns The feedback entries.
 */
feedbackSchema.statics.listFeedback = async function (): Promise<IFeedback[]> {
    return await this.find({});
};

/**
 * Gets all feedback entries between the given dates or all if no dates are given.
 * @param from - The start date.
 * @param to - The end date.
 * @returns The feedback entries.
 */
feedbackSchema.statics.getAll = async function (
    from?: Date,
    to?: Date
): Promise<APIFeedback[]> {
    from = from || new Date(0);
    to = to || new Date();

    const feedbackDocuments = await this.find({
        createdAt: {
            $gte: from,
            $lte: to,
        },
    });

    const feedback: APIFeedback[] = feedbackDocuments.map(
        (feedbackDocument) => {
            return {
                type: feedbackDocument.type,
                description: feedbackDocument.description,
                creatorId: feedbackDocument.creatorId,
                creatorName: feedbackDocument.creatorName,
            };
        }
    );

    return feedback;
};

/**
 * The guild model.
 */
export default mongoose.model<IFeedback, FeedbackModel>(
    "Feedback",
    feedbackSchema
);
