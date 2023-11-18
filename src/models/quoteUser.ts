import { Model, Schema, Document, model } from "mongoose";
import { PotentialGuildMember } from "./potentialGuildMember";

export interface QuoteUser extends Document {
    user?: PotentialGuildMember["_id"];
    name: string;
}

interface QuoteUserModel extends Model<QuoteUser> {}

const quoteUserSchema = new Schema<QuoteUser, QuoteUserModel>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "PotentialGuildMember",
    },
    name: {
        type: String,
        required: true,
    },
});

const quoteUserModel = model<QuoteUser, QuoteUserModel>("QuoteUser", quoteUserSchema);

export default quoteUserModel;
