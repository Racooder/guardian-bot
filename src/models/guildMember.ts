import { Model, Schema, Document, model } from "mongoose";

export interface GuildMember extends Document {
    guild: string;
    user: string;
    nickname?: string;
}

interface GuildMemberModel extends Model<GuildMember> {}

const guildMemberSchema = new Schema<GuildMember, GuildMemberModel>({
    guild: {
        type: String,
        ref: "Guild",
        required: true,
    },
    user: {
        type: String,
        ref: "DiscordUser",
        required: true,
    },
    nickname: {
        type: String,
    },
});

guildMemberSchema.index({ guild: 1, user: 1 }, { unique: true });

const guildMemberModel = model<GuildMember, GuildMemberModel>(
    "GuildMember",
    guildMemberSchema
);

export default guildMemberModel;
