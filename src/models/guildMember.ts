import { Model, Schema, Document, model } from "mongoose";
import { IGuild } from "./guild";
import { IDiscordUser } from "./discordUser";

export interface IGuildMember extends Document {
    user: string;
    guild?: string;
    nickname?: string;

    // Virtuals
    isMember: boolean;
}

interface GuildMemberModel extends Model<IGuildMember> {
    update(user: IDiscordUser, guild?: IGuild, nickname?: string): Promise<IGuildMember>;
}

const guildMemberSchema = new Schema<IGuildMember, GuildMemberModel>({
    user: {
        type: String,
        ref: "DiscordUser",
        required: true,
    },
    guild: {
        type: String,
        ref: "Guild",
    },
    nickname: {
        type: String,
    },
});

guildMemberSchema.virtual("isMember").get(function (this: IGuildMember) {
    return this.guild !== undefined;
});

guildMemberSchema.static("update", async function (user: IDiscordUser, guild?: IGuild, nickname?: string) {
    return this.findOneAndUpdate({ user: user.id }, { guild: guild?.id, nickname }, { upsert: true });
});

const guildMemberModel = model<IGuildMember, GuildMemberModel>(
    "GuildMember",
    guildMemberSchema
);

export default guildMemberModel;
