import { Model, Schema, Document, model } from "mongoose";
import { GuildMember } from "./guildMember";
import { DiscordUser } from "./discordUser";

export interface PotentialGuildMember extends Document {
    user: String;
    guildMember?: GuildMember["_id"];
}

interface PotentialGuildMemberModel extends Model<PotentialGuildMember> {}

const potentialGuildMemberSchema = new Schema<
    PotentialGuildMember,
    PotentialGuildMemberModel
>({
    user: {
        type: String,
        ref: "DiscordUser",
        required: true,
    },
    guildMember: {
        type: Schema.Types.ObjectId,
        ref: "GuildMember",
    },
});

const potentialGuildMemberModel = model<PotentialGuildMember, PotentialGuildMemberModel>(
    "PotentialGuildMember",
    potentialGuildMemberSchema
);

export default potentialGuildMemberModel;
