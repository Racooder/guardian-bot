import { Model, Schema, Document, model } from "mongoose";
import { IDiscordUser } from "./discordUser";

export type FeedbackType = "bug" | "feature" | "other";

export interface IFeedback extends Document {
    type: FeedbackType;
    description: string;
    creator: IDiscordUser["_id"];
    guild?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface FeedbackModel extends Model<IFeedback> {}

const feedbackSchema = new Schema<IFeedback, FeedbackModel>(
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
            type: String,
            ref: "DiscordUser",
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

const feedbackModel = model<IFeedback, FeedbackModel>("Feedback", feedbackSchema);

export default feedbackModel;
