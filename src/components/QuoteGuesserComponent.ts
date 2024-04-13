import { debug } from "../Log";
import { Component, ReplyType, Response } from '../Interactions';
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import { RawStatistic } from "../models/statistic";
import statisticKeys from "../../data/statistic-keys.json";
import { Dict } from "../Essentials";
import quoteGuesserModel, { QuoteGuesserGame } from "../models/quoteGuesser";
import { newRound, quoteGuesserMessage } from "../commands/QuoteGuesser";
import { BotUser } from "../models/botUser";

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

        const gameDocument = await quoteGuesserModel.findById(data[1]).populate("currentQuote").populate("correctAuthor").exec();
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
    return roundResultsMessage(gameDocument);
}

async function handleEnd(gameDocument: QuoteGuesserGame): Promise<handlerReturnType> {
    return [ [gameResultsMessage(gameDocument)], [] ];
}

async function handleNext(gameDocument: QuoteGuesserGame, _: ButtonInteraction, botUser: BotUser): Promise<handlerReturnType> {
    const response =  await newRound(botUser, gameDocument);
    if (response.embeds === undefined || response.components === undefined) {
        return quoteGuesserMessage(gameDocument, gameDocument.currentQuote);
    }
    return [response.embeds as EmbedBuilder[], response.components as ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[]];
}

async function handleAnswer(gameDocument: QuoteGuesserGame, interaction: StringSelectMenuInteraction): Promise<handlerReturnType>  {
    const answer = interaction.values[0];
    gameDocument.answers.push([interaction.user.id, answer]);
    gameDocument.save();

    return quoteGuesserMessage(gameDocument, gameDocument.currentQuote.statements[0]);
}

function roundResultsMessage(gameDocument: QuoteGuesserGame): [EmbedBuilder[], ActionRowBuilder<ButtonBuilder>[]] {
    debug("Creating round results message");

    const results = gameDocument.answers;
    const round = gameDocument.usedQuotes.length;
    const quote = gameDocument.currentQuote.statements[0] as string;
    const author = gameDocument.correctAuthor[0];

    let correctAnswers = 0;
    for (const answer of results) {
        if (answer[1] === author) {
            correctAnswers++;
        }
    }

    let correctAnswersText = "No one answered correctly";
    if (correctAnswers > 0) {
        correctAnswersText = `${correctAnswers} ${correctAnswers === 1 ? "person has" : "people have"} answered correctly`;
    }

    const embedBuilder = new EmbedBuilder()
        .setAuthor({ name: `Quote Guesser - Round ${round} Results` })
        .setTitle(`The correct answer was: ${author}`)
        .setDescription(`"${quote}" - ${author}`)
        .addFields(results.map(([name, answer]) => {
            return { name: `${name}'s answer`, value: `${answer} ${answer[1] === author ? "✅" : "❌"}`};
        }))
        .setFooter({ text: correctAnswersText });

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`quote-guesser-next-${round}`)
                .setLabel("Next Round")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`quote-guesser-stop-${round}`)
                .setLabel("Stop Game")
                .setStyle(ButtonStyle.Danger),
        ) as ActionRowBuilder<ButtonBuilder>;

    return [[embedBuilder], [actionRow]];
}

function gameResultsMessage(gameDocument: QuoteGuesserGame): EmbedBuilder {
    debug("Creating game results message");

    const results = Object.entries(gameDocument.scores);
    const round = gameDocument.usedQuotes.length;

    const embedBuilder = new EmbedBuilder()
        .setAuthor({ name: `Quote Guesser - Game Results` })
        .setTitle(`Game Over!`)
        .setDescription(`The game has ended after ${round} rounds`)
        .addFields(results.map(([name, score]) => {
            return { name, value: score.toString() };
        }));

    return embedBuilder;
}
