import { Model, Schema, Document, model } from "mongoose";
import { IGuildMember } from "./guildMember";

export interface IQuoteUser extends Document {
    name: string;
    user?: IGuildMember["_id"];

    // Virtuals
    isDiscordUser: boolean;
}

interface QuoteUserModel extends Model<IQuoteUser> {}

const quoteUserSchema = new Schema<IQuoteUser, QuoteUserModel>({
    name: {
        type: String,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "GuildMember",
    },
});

quoteUserSchema.virtual("isDiscordUser").get(function (this: IQuoteUser) {
    return this.user !== undefined;
});

const quoteUserModel = model<IQuoteUser, QuoteUserModel>("QuoteUser", quoteUserSchema);

export default quoteUserModel;
