import { Model, Schema, Document, model } from "mongoose";
import { DiscordUser } from "./discordUser";

export interface FeedbackUser extends Document {
    user: string;
}

interface FeedbackUserModel extends Model<FeedbackUser> {}

const feedbackUserSchema = new Schema<FeedbackUser, FeedbackUserModel>({
    user: {
        type: String,
        ref: "DiscordUser",
        required: true,
        unique: true,
    },
});

const feedbackUserModel = model<FeedbackUser, FeedbackUserModel>(
    "FeedbackUser",
    feedbackUserSchema
);

export default feedbackUserModel;
