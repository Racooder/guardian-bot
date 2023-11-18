import { Model, Schema, Document, model } from "mongoose";
import { CodenamesUser } from './codenamesUser';

export interface CodenamesWord extends Document {
    guild: string;
    word: string;
    creator: CodenamesUser["_id"];
}

interface CodenamesWordModel extends Model<CodenamesWord> {}

const codenamesWordSchema = new Schema<CodenamesWord, CodenamesWordModel>({
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
    }
});

codenamesWordSchema.index({ guild: 1, word: 1 }, { unique: true });

const codenamesWordModel = model<CodenamesWord, CodenamesWordModel>(
    "CodenamesWord",
    codenamesWordSchema
);

export default codenamesWordModel;
