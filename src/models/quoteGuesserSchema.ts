import mongoose, { Model, Schema, Document } from "mongoose";
import settings from "../settings.json";
import { GuildMember } from "discord.js";
import { clearOld, usernameString } from "../Essentials";
import guildMemberSchema from "./guildMemberSchema";
import { BaseUser } from "./quoteSchema";

/**
 * Represents a quote guesser game in the database.
 */
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

/**
 * Holds the functions for the quote guesser schema.
 */
interface QuoteGuesserModel extends Model<IQuoteGuesser> {
    /**
     * Gets the correct answer of the current round of a quote guesser game.
     * @param guildId - The ID of the guild.
     * @param token - The token of the quote guesser game.
     * @returns The correct answer or null if the game doesn't exist.
     */
    getAnswer: (guildId: string, token: string) => Promise<BaseUser | null>;
    /**
     * Adds an player answer to the current round of a quote guesser game.
     * @param guildId - The ID of the guild.
     * @param token - The token of the quote guesser game.
     * @param user - The user who answered.
     * @param answer - The answer of the user.
     * @returns 1: The answer was correct, 2: The answer was wrong, 3: The game doesn't exist, 4: The user already answered correctly, 5: The user already answered wrong
     */
    addAnswer: (
        guildId: string,
        token: string,
        user: GuildMember,
        answer: string
    ) => Promise<number>;
    /**
     * Clears all quote guesser games that are older than the quote guesser lifetime.
     */
    clearOld: () => Promise<void>;
    /**
     * Gets the number of answers of the current round of a quote guesser game.
     * @param guildId - The ID of the guild.
     * @param token - The token of the quote guesser game.
     * @returns The number of answers.
     */
    getAnswerCount: (guildId: string, token: string) => Promise<number>;
}

type ResultTranslation = {
    [key: number]: string;
};

/**
 * Translates the result code to a message
 */
export const resultTranslation: ResultTranslation = {
    1: "Your answer was correct!",
    2: "Your answer was wrong!",
    3: "No game found with that token",
    4: "You have already answered correctly!\nYou can't change your answer",
    5: "You have already answered incorrectly!\nYou can't change your answer",
};

/**
 * The database schema for a quote guesser game.
 */
const quoteGuesserSchema = new Schema<IQuoteGuesser, QuoteGuesserModel>(
    {
        guildId: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        quote: {
            type: String,
            required: true,
        },
        authorId: {
            type: String,
        },
        authorName: {
            type: String,
            required: true,
        },
        authorAlias: {
            type: String,
        },
        correctAnswerIds: {
            type: [String],
            required: true,
            default: [],
        },
        wrongAnswerIds: {
            type: [String],
            required: true,
            default: [],
        },
        correctAnswerNames: {
            type: [String],
            required: true,
            default: [],
        },
        wrongAnswerNames: {
            type: [String],
            required: true,
            default: [],
        },
        round: {
            type: Number,
            required: true,
            default: 1,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Gets the current round of a quote guesser game.
 * @param model - The quote guesser model.
 * @param guildId - The ID of the guild.
 * @param token - The token of the quote guesser game.
 * @returns The current round.
 */
export const findCurrentRound = async function (
    model: QuoteGuesserModel,
    guildId: string,
    token: string
): Promise<number> {
    const quoteGuesser = await model.find({ guildId, token });
    let round = 0;
    if (quoteGuesser && (await model.exists({ token: token }))) {
        let oldGames = await model.find({ guildId: guildId, token: token });
        if (oldGames.length > 1) {
            oldGames = oldGames.sort((a, b) => (b.round || 0) - (a.round || 0));
        }
        round = oldGames[0].round || 1;
    }
    return round;
};

/**
 * Gets the correct answer of the current round of a quote guesser game.
 * @param guildId - The ID of the guild.
 * @param token - The token of the quote guesser game.
 * @returns The correct answer or null if the game doesn't exist.
 */
quoteGuesserSchema.statics.getAnswer = async function (
    guildId: string,
    token: string
): Promise<BaseUser | null> {
    const round = await findCurrentRound(this, guildId, token);
    const quoteGuesser = await this.findOne({ guildId, token, round });

    if (!quoteGuesser) return null;
    return {
        id: quoteGuesser.authorId,
        name: quoteGuesser.authorName,
    };
};

/**
 * Checks if the answer is correct.
 * @param document - The quote guesser game.
 * @param answer - The answer of the user.
 * @returns If the answer is correct.
 */
export const checkAnswer = function (
    document: IQuoteGuesser,
    answer: string
): boolean {
    return ((document.authorId && document.authorId === answer) ||
        (document.authorName &&
            document.authorName?.toLowerCase() === answer.toLowerCase()) ||
        (document.authorAlias &&
            document.authorAlias?.toLowerCase() ===
                answer.toLowerCase())) as boolean;
};

export const saveAnswer = async function (
    document: IQuoteGuesser,
    correct: boolean,
    user: GuildMember
): Promise<void> {
    if (correct) {
        document.correctAnswerIds.push(user.id);
        document.correctAnswerNames.push(usernameString(user));
    } else {
        document.wrongAnswerIds.push(user.id);
        document.wrongAnswerNames.push(usernameString(user));
    }
    await document.save();
};

/**
 * Adds an player answer to the current round of a quote guesser game.
 * @param guildId - The ID of the guild.
 * @param token - The token of the quote guesser game.
 * @param user - The user who answered.
 * @param answer - The answer of the user.
 * @returns 1: The answer was correct, 2: The answer was wrong, 3: The game doesn't exist, 4: The user already answered correctly, 5: The user already answered wrong
 */
quoteGuesserSchema.statics.addAnswer = async function (
    guildId: string,
    token: string,
    user: GuildMember,
    answer: string
): Promise<number> {
    // Get the current round of the game
    const round = await findCurrentRound(this, guildId, token);
    const quoteGuesser = await this.findOne({ guildId, token, round });

    if (!quoteGuesser) return 3; // The game doesn't exist
    if (quoteGuesser.correctAnswerIds.includes(user.id)) return 4; // The user already answered correctly
    if (quoteGuesser.wrongAnswerIds.includes(user.id)) return 5; // The user already answered wrong

    // Check if the answer is correct
    if (checkAnswer(quoteGuesser, answer)) {
        // Save the user as correct answerer
        await saveAnswer(quoteGuesser, true, user);
        // Increment the score of the user
        guildMemberSchema
            .findOneAndUpdate(
                { guildId: guildId, userId: user.id },
                { $inc: { quoteGuesserScore: 1 } }
            )
            .exec();

        return 1; // The answer was correct
    }
    // Save the user as wrong answerer
    await saveAnswer(quoteGuesser, false, user);

    return 2; // The answer was wrong
};

/**
 * Clears all quote guesser games that are older than the quote guesser lifetime.
 */
quoteGuesserSchema.statics.clearOld = async function () {
    clearOld(this, 1000 * 60 * 60 * settings.quoteGuesserLifetime);
};

/**
 * Gets the number of answers of the current round of a quote guesser game.
 * @param guildId - The ID of the guild.
 * @param token - The token of the quote guesser game.
 * @returns The number of answers.
 */
quoteGuesserSchema.statics.getAnswerCount = async function (
    guildId: string,
    token: string
): Promise<number> {
    const round = await findCurrentRound(this, guildId, token);
    const quoteGuesser = await this.findOne({ guildId, token, round });

    if (!quoteGuesser) return 0;
    return (
        quoteGuesser.correctAnswerIds.length +
        quoteGuesser.wrongAnswerIds.length
    );
};

/**
 * The quote guesser model.
 */
export default mongoose.model<IQuoteGuesser, QuoteGuesserModel>(
    "QuoteGuesser",
    quoteGuesserSchema
);
