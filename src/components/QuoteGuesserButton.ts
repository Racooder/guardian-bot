import { debug } from "../Log";
import { Component, ReplyType, Response } from '../InteractionEssentials';
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, EmbedBuilder } from "discord.js";
import quoteGuesserModel, { QuoteGuesserGame } from "../models/quoteGuesser";
import { newRound } from "../commands/QuoteGuesser";
import discordUserModel from "../models/discordUser";

export const GAME_NOT_FOUND = {
    replyType: ReplyType.Reply,
    ephemeral: true,
    content: "Game not found",
};

export const QuoteGuesserButton: Component<ButtonInteraction> = {
    name: "quote_guesser_button",
    type: ComponentType.Button,
    subcomponents: {
        finish: {
            run: async (client, interaction, botUser, data) => {
                const gameDocument = await quoteGuesserModel.findById(data[0]).populate("currentQuote").exec();
                if (gameDocument === null) {
                    return GAME_NOT_FOUND;
                }

                for (const answer of gameDocument.answers.entries()) {
                    if (answer[1] === gameDocument.correctAuthor[0]) {
                        const prevScore = gameDocument.scores.get(answer[0]) || 0;
                        gameDocument.scores.set(answer[0], prevScore + 1);
                    }
                }
                gameDocument.save();

                return roundResultsMessage(gameDocument);
            },
        },
        end: {
            run: async (client, interaction, botUser, data) => {
                const gameDocument = await quoteGuesserModel.findById(data[0]);
                if (gameDocument === null) {
                    return GAME_NOT_FOUND;
                }

                const resultMessage = gameResultsMessage(gameDocument);
                quoteGuesserModel.findByIdAndDelete(gameDocument._id).exec();
                return resultMessage;
            },
        },
        next: {
            run: async (client, interaction, botUser, data) => {
                const gameDocument = await quoteGuesserModel.findById(data[0]).populate("currentQuote").exec();
                if (gameDocument === null) {
                    return GAME_NOT_FOUND;
                }

                const response = await newRound(botUser, gameDocument);
                return response;
            },
        }
    },
};

async function roundResultsMessage(gameDocument: QuoteGuesserGame): Promise<Response> {
    debug("Creating round results message");

    const quote = gameDocument.currentQuote.statements[0] as string;
    const round = gameDocument.usedQuotes.length;
    const correctAuthor = gameDocument.correctAuthor[0];

    const embedBuilder = new EmbedBuilder()
    .setAuthor({ name: `Quote Guesser - Round ${round} Results` })
    .setTitle(`The correct answer was ${correctAuthor}`)
    .setDescription(`"${quote}" - ${correctAuthor}`)

    const answers = gameDocument.answers.entries();
    const choices = gameDocument.choices;
    choices.set(correctAuthor, gameDocument.correctAuthor[1]);

    let correctAnswers = 0;
    for (const answer of answers) {
        if (answer[1] === correctAuthor) {
            correctAnswers++;
        }
        const userDocument = await discordUserModel.findOne({ userId: answer[0] })
        if (userDocument === null) continue;
        embedBuilder.addFields({ name: `${userDocument.name}'s answer`, value: `${choices.get(answer[1])} ${answer[1] === correctAuthor ? "✅" : "❌"}` });
    }

    if (correctAnswers > 0) {
        embedBuilder.setFooter({ text: `${correctAnswers} ${correctAnswers === 1 ? "person has" : "people have"} answered correctly` });
    } else {
        embedBuilder.setFooter({ text: "No one answered correctly" });
    }

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`quote_guesser_button;next;${gameDocument._id}`)
                .setLabel("Next Round")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`quote_guesser_button;end;${gameDocument._id}`)
                .setLabel("End Game")
                .setStyle(ButtonStyle.Danger),
        ) as ActionRowBuilder<ButtonBuilder>;

    return {
        replyType: ReplyType.Update,
        embeds: [embedBuilder],
        components: [actionRow],
    };
}

async function gameResultsMessage(gameDocument: QuoteGuesserGame): Promise<Response> {
    debug("Creating game results message");

    const round = gameDocument.usedQuotes.length;
    const embedBuilder = new EmbedBuilder()
        .setAuthor({ name: `Quote Guesser - Game Results` })
        .setTitle(`Game Over!`)
        .setDescription(`The game has ended after ${round} rounds`)

    for (const result of gameDocument.scores.entries()) {
        const userDocument = await discordUserModel.findOne({ userId: result[0] });
        if (userDocument === null) continue;
        embedBuilder.addFields({ name: userDocument.name, value: `${result[1]} ${result[1] === 1 ? "point" : "points"}` });
    }

    return {
        replyType: ReplyType.Update,
        embeds: [embedBuilder],
        components: [],
    }
}
