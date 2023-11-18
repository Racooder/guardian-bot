import { Model, Schema, Document, model } from "mongoose";
import { FeedbackUser } from "./feedbackUser";

export type FeedbackType = "bug" | "feature" | "other";

export interface Feedback extends Document {
    type: FeedbackType;
    description: string;
    creator: FeedbackUser["_id"];
    guild?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface FeedbackModel extends Model<Feedback> {}

const feedbackSchema = new Schema<Feedback, FeedbackModel>(
    {
        type: {
            type: String,
            enum: ["bug", "feature", "other"],
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: "FeedbackUser",
            required: true,
        },
        guild: {
            type: String,
            ref: "Guild",
        },
    },
    {
        timestamps: true,
    }
);

const feedbackModel = model<Feedback, FeedbackModel>("Feedback", feedbackSchema);

export default feedbackModel;
