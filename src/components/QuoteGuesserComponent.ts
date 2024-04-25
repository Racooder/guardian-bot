import { debug } from "../Log";
import { Component, ReplyType, Response } from '../Interactions';
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import { RawStatistic } from "../models/statistic";
import statisticKeys from "../../data/statistic-keys.json";
import { Dict } from "../Essentials";
import quoteGuesserModel, { QuoteGuesserGame } from "../models/quoteGuesser";
import { newRound, quoteGuesserMessage } from "../commands/QuoteGuesser";
import { BotUser } from "../models/botUser";
import discordUserModel from "../models/discordUser";

export const QuoteGuesserComponent: Component<ButtonInteraction | StringSelectMenuInteraction> = {
    name: "quote-guesser",
    type: ComponentType.Button,
    run: async (client, interaction, botUser, data) => {
        debug("QuoteListNext component called");

        const statistic: RawStatistic = {
            global: false,
            key: statisticKeys.bot.event.interaction.component.quoteGuesser,
            user: botUser
        };

        if (data.length < 2) {
            const response: Response = {
                replyType: ReplyType.Reply,
                ephemeral: true,
                content: "Invalid data", // TODO: Error Handling
            };
            return { response, statistic };
        }

        const handler = HANDLER[data[0]];
        if (handler === undefined) {
            const response: Response = {
                replyType: ReplyType.Reply,
                ephemeral: true,
                content: "Invalid handler", // TODO: Error Handling
            };
            return { response, statistic };
        }

        const gameDocument = await quoteGuesserModel.findById(data[1]).populate("currentQuote").exec();
        if (gameDocument === null) {
            const response: Response = {
                replyType: ReplyType.Reply,
                ephemeral: true,
                content: "Game not found", // TODO: Error Handling
            };
            return { response, statistic };
        }

        const [embedBuilders, actionRows] = await handler(gameDocument, interaction, botUser);

        const response: Response = {
            replyType: ReplyType.Update,
            embeds: embedBuilders,
            components: actionRows,
        };

        return { response, statistic };
    },
};

type handlerReturnType = [EmbedBuilder[], ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[]];
type handlerFunction = (gameDocument: QuoteGuesserGame, interaction: ButtonInteraction | StringSelectMenuInteraction, botUser: BotUser) => Promise<handlerReturnType>;

const HANDLER = {
    finish: handleFinish,
    end: handleEnd,
    next: handleNext,
    answer: handleAnswer,
} as Dict<handlerFunction>;

async function handleFinish(gameDocument: QuoteGuesserGame): Promise<handlerReturnType> {
    for (const answer of gameDocument.answers.entries()) {
        if (answer[1] === gameDocument.correctAuthor[0]) {
            const prevScore = gameDocument.scores.get(answer[0]) || 0;
            gameDocument.scores.set(answer[0], prevScore + 1);
        }
    }
    gameDocument.save();

    return roundResultsMessage(gameDocument);
}

async function handleEnd(gameDocument: QuoteGuesserGame): Promise<handlerReturnType> {
    const resultMessage = gameResultsMessage(gameDocument);
    quoteGuesserModel.findByIdAndDelete(gameDocument._id).exec();
    return resultMessage;
}

async function handleNext(gameDocument: QuoteGuesserGame, _: ButtonInteraction, botUser: BotUser): Promise<handlerReturnType> {
    const response = await newRound(botUser, gameDocument);
    if (response.embeds === undefined || response.components === undefined) {
        return quoteGuesserMessage(gameDocument, gameDocument.currentQuote);
    }
    return [response.embeds as EmbedBuilder[], response.components as ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[]];
}

async function handleAnswer(gameDocument: QuoteGuesserGame, interaction: StringSelectMenuInteraction): Promise<handlerReturnType>  {
    const answer = interaction.values[0];
    gameDocument.answers.set(interaction.user.id, answer);
    gameDocument.save();

    return quoteGuesserMessage(gameDocument, gameDocument.currentQuote.statements[0]);
}

async function roundResultsMessage(gameDocument: QuoteGuesserGame): Promise<[EmbedBuilder[], ActionRowBuilder<ButtonBuilder>[]]> {
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
                .setCustomId(`quote-guesser:next:${gameDocument._id}`)
                .setLabel("Next Round")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`quote-guesser:end:${gameDocument._id}`)
                .setLabel("End Game")
                .setStyle(ButtonStyle.Danger),
        ) as ActionRowBuilder<ButtonBuilder>;

    return [[embedBuilder], [actionRow]];
}

async function gameResultsMessage(gameDocument: QuoteGuesserGame): Promise<[EmbedBuilder[], []]> {
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

    return [[embedBuilder], []];
}
