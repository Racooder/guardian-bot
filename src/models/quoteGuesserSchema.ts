import mongoose, { Model, Schema, Document } from "mongoose";
import settings from "../settings.json";
import { GuildMember } from "discord.js";
import { usernameString } from "../Essentials";
import guildMemberSchema from "./guildMemberSchema";

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
    createdAt: Date;
    updatedAt: Date;
}

export interface IQuoteGuesserAnswer {
    authorId?: string;
    authorName?: string;
}

interface QuoteGuesserModel extends Model<IQuoteGuesser> {
    getAnswer: (guildId: string, token: string) => Promise<IQuoteGuesserAnswer | null>;
    addAnswer: (guildId: string, token: string, user: GuildMember, answer: IQuoteGuesserAnswer) => Promise<string>;
    clearOld: () => Promise<void>;
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
    }
}, {
    timestamps: true
});

quoteGuesserSchema.statics.getAnswer = async function (guildId: string, token: string): Promise<IQuoteGuesserAnswer | null> {
    const quoteGuesser = await this.findOne({ guildId, token });
    if (!quoteGuesser) return null;
    return {
        authorId: quoteGuesser.authorId,
        authorName: quoteGuesser.authorName
    }
}

quoteGuesserSchema.statics.addAnswer = async function (guildId: string, token: string, user: GuildMember, answer: IQuoteGuesserAnswer): Promise<string> {
    const quoteGuesser = await this.findOne({ guildId, token });    
    if (!quoteGuesser) return "No game found with that token";
    if (quoteGuesser.correctAnswerIds.includes(user.id)) return "You have already answered correctly";
    if (quoteGuesser.wrongAnswerIds.includes(user.id)) return "You have already answered incorrectly";
    
    if ((quoteGuesser.authorId && quoteGuesser.authorId === answer.authorId) ||
        (quoteGuesser.authorName && quoteGuesser.authorName?.toLowerCase() === answer.authorName?.toLowerCase()) ||
        (quoteGuesser.authorAlias && quoteGuesser.authorAlias?.toLowerCase() === answer.authorName?.toLowerCase())) {
            quoteGuesser.correctAnswerIds.push(user.id);
            quoteGuesser.correctAnswerNames.push(usernameString(user));
            await quoteGuesser.save();
            guildMemberSchema.findOneAndUpdate({ guildId: guildId, userId: user.id }, { $inc: { quoteGuesserScore: 1 } }).exec();
            return "Your answer was correct!";
    }
    quoteGuesser.wrongAnswerIds.push(user.id);
    quoteGuesser.wrongAnswerNames.push(usernameString(user));
    await quoteGuesser.save();
    return "Your answer was wrong!";
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

export default mongoose.model<IQuoteGuesser, QuoteGuesserModel>("QuoteGuesser", quoteGuesserSchema);
