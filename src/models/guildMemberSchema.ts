import mongoose, { Model, Schema, Document } from "mongoose";

export interface IGuildMember extends Document {
    guildId: string;
    userId: string;
    username: string;
    displayName: string;
    discriminator?: string;
}

interface GuildMemberModel extends Model<IGuildMember> {
    updateNames: (guildId: string, userId: string, username: string, discriminator?: string, displayName?: string) => Promise<IGuildMember>;
}

const guildMemberSchema = new Schema<IGuildMember, GuildMemberModel>({
    guildId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    displayName: {
        type: String
    },
    discriminator: {
        type: String
    }
});

guildMemberSchema.static("updateNames", function (guildId: string, userId: string, username: string, displayName?: string, discriminator?: string): Promise<IGuildMember> {
    if (!displayName) displayName = username;
    return this.findOneAndUpdate(
        { guildId, userId },
        { username, displayName, discriminator },
        { upsert: true, new: true }
    );
});

export default mongoose.model<IGuildMember, GuildMemberModel>("GuildMember", guildMemberSchema);
