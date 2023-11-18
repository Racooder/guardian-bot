import { Model, Schema, Document, model } from "mongoose";
import { PotentialGuildMember } from "./potentialGuildMember";

export interface CodenamesUser extends Document {
    user: PotentialGuildMember["_id"];
}

interface CodenamesUserModel extends Model<CodenamesUser> {}

const codenamesUserSchema = new Schema<CodenamesUser, CodenamesUserModel>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "PotentialGuildMember",
        required: true,
        unique: true,
    }
});

const codenamesUserModel = model<CodenamesUser, CodenamesUserModel>(
    "CodenamesUser",
    codenamesUserSchema
);

export default codenamesUserModel;
