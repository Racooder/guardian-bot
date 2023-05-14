import mongoose, { Model, Schema, Document } from "mongoose";
import settings from "../settings.json";
import { GuildMember } from "discord.js";
import { usernameString } from "../Essentials";
import guildMemberSchema from "./guildMemberSchema";
import { IBaseUser } from "./quoteSchema";

export interface IQuoteGuesser extends Document {
    guildId: string;
    token: string;
    quote: string;
    authorId?: string;
    authorName: string;
    authorAlias?: string;
    correctAnswerIds: string[];
    wrongAnswerIds: string[];
    correctAnswerNames: string[];
    wrongAnswerNames: string[];
    round: number;
    createdAt: Date;
    updatedAt: Date;
}

interface QuoteGuesserModel extends Model<IQuoteGuesser> {
    getAnswer: (guildId: string, token: string) => Promise<IBaseUser | null>;
    addAnswer: (guildId: string, token: string, user: GuildMember, answer: string) => Promise<number>;
    clearOld: () => Promise<void>;
    getAnswerCount: (guildId: string, token: string) => Promise<number>;
}

const quoteGuesserSchema = new Schema<IQuoteGuesser, QuoteGuesserModel>({
    guildId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    quote: {
        type: String,
        required: true
    },
    authorId: {
        type: String
    },
    authorName: {
        type: String,
        required: true
    },
    authorAlias: {
        type: String
    },
    correctAnswerIds: {
        type: [String],
        required: true,
        default: []
    },
    wrongAnswerIds: {
        type: [String],
        required: true,
        default: []
    },
    correctAnswerNames: {
        type: [String],
        required: true,
        default: []
    },
    wrongAnswerNames: {
        type: [String],
        required: true,
        default: []
    },
    round: {
        type: Number,
        required: true,
        default: 1
    }
}, {
    timestamps: true
});

export const findCurrentRound = async function (model: QuoteGuesserModel, guildId: string, token: string): Promise<number> {
    const quoteGuesser = await model.find({ guildId, token });
    let round = 0;
    if (quoteGuesser && await model.exists({ token: token })) {
        let oldGames = await model.find({ guildId: guildId, token: token });
        if (oldGames.length > 1) {
            oldGames = oldGames.sort((a, b) => (b.round || 0) - (a.round || 0));
        }
        round = (oldGames[0].round || 1);
    }
    return round;
}

quoteGuesserSchema.statics.getAnswer = async function (guildId: string, token: string): Promise<IBaseUser | null> {
    const round = await findCurrentRound(this, guildId, token);
    const quoteGuesser = await this.findOne({ guildId, token, round });
    
    if (!quoteGuesser) return null;
    return {
        id: quoteGuesser.authorId,
        name: quoteGuesser.authorName
    }
}

quoteGuesserSchema.statics.addAnswer = async function (guildId: string, token: string, user: GuildMember, answer: string): Promise<number> {
    const round = await findCurrentRound(this, guildId, token);
    const quoteGuesser = await this.findOne({ guildId, token, round });

    if (!quoteGuesser) return 3;
    if (quoteGuesser.correctAnswerIds.includes(user.id)) return 4;
    if (quoteGuesser.wrongAnswerIds.includes(user.id)) return 5;
    
    if ((quoteGuesser.authorId && quoteGuesser.authorId === answer) ||
        (quoteGuesser.authorName && quoteGuesser.authorName?.toLowerCase() === answer.toLowerCase()) ||
        (quoteGuesser.authorAlias && quoteGuesser.authorAlias?.toLowerCase() === answer.toLowerCase())) {
            quoteGuesser.correctAnswerIds.push(user.id);
            quoteGuesser.correctAnswerNames.push(usernameString(user));
            await quoteGuesser.save();
            guildMemberSchema.findOneAndUpdate({ guildId: guildId, userId: user.id }, { $inc: { quoteGuesserScore: 1 } }).exec();
            return 1;
    }
    quoteGuesser.wrongAnswerIds.push(user.id);
    quoteGuesser.wrongAnswerNames.push(usernameString(user));
    await quoteGuesser.save();
    return 2;
}

quoteGuesserSchema.statics.clearOld = async function () {
    const now = new Date();
    const old = new Date(now.getTime() - 1000 * 60 * 60 * settings.quoteGuesserLifetime);
    
    const guesserDocuments = await this.find({});

    const oldGuesserDocuments = guesserDocuments.filter((quoteListDocument) => {
        return quoteListDocument.updatedAt < old;
    });

    for (const oldQuoteListDocument of oldGuesserDocuments) {
        await oldQuoteListDocument.deleteOne();
    }
};

quoteGuesserSchema.statics.getAnswerCount = async function (guildId: string, token: string): Promise<number> {
    const round = await findCurrentRound(this, guildId, token);
    const quoteGuesser = await this.findOne({ guildId, token, round });

    if (!quoteGuesser) return 0;
    return quoteGuesser.correctAnswerIds.length + quoteGuesser.wrongAnswerIds.length;
}

export default mongoose.model<IQuoteGuesser, QuoteGuesserModel>("QuoteGuesser", quoteGuesserSchema);
