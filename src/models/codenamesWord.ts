import { Model, Schema, Document, model } from "mongoose";
import { IGuildMember } from "./guildMember";

export interface ICodenamesWord extends Document {
    guild: string;
    word: string;
    creator: IGuildMember["_id"];
}

interface CodenamesWordModel extends Model<ICodenamesWord> {}

const codenamesWordSchema = new Schema<ICodenamesWord, CodenamesWordModel>({
    guild: {
        type: String,
        ref: "Guild",
        required: true,
    },
    word: {
        type: String,
        required: true,
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "CodenamesUser",
        required: true,
    },
});

codenamesWordSchema.index({ guild: 1, word: 1 }, { unique: true });

const codenamesWordModel = model<ICodenamesWord, CodenamesWordModel>(
    "CodenamesWord",
    codenamesWordSchema
);

export default codenamesWordModel;
