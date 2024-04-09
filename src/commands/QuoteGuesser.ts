import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { Command, ReplyType, Response } from "../Interactions";
import { debug } from "../Log";
import statisticKeys from "../../data/statistic-keys.json"
import { RawStatistic } from "../models/statistic";
import quoteGuesserModel, { createQuoteGuesserGame, QuoteGuesserGame } from "../models/quoteGuesser";
import { Dict } from "../Essentials";
import { randomQuote } from "../models/quote";
import { BotUser } from "../models/botUser";

export const QuoteGuesser: Command = {
    name: "quote-guesser",
    description: "Play the quote guesser game.",
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction, botUser) => {
        debug("QuoteGuesser command called");

        const statistic: RawStatistic = {
            global: false,
            key: statisticKeys.bot.event.interaction.command.quoteGuesser,
            user: botUser
        };

        const document = await createQuoteGuesserGame();
        const response = await newRound(document, botUser);

        return { response, statistic };
    },
};

export async function newRound(document: QuoteGuesserGame, botUser: BotUser): Promise<Response>{
    if (document === null) {
        return {
            replyType: ReplyType.Reply,
            ephemeral: true,
            content: "Game not found", // TODO: Error Handling
        };
    }
    const [quote, authors] = await randomQuote(botUser, document.usedQuotes);
    if (quote === undefined) {
        return {
            replyType: ReplyType.Reply,
            ephemeral: true,
            content: "No quotes left to guess", // TODO: Error Handling
        };
    }
    if (authors === undefined) {
        return {
            replyType: ReplyType.Reply,
            ephemeral: true,
            content: "No authors found", // TODO: Error Handling
        };
    }
    document.usedQuotes.push(quote._id);
    await document.save();
    const [embedBuilder, actionRows] = quoteGuesserMessage(document._id, quote.statements[0], document.usedQuotes.length, 0, authors)

    return {
        replyType: ReplyType.Reply,
        embeds: [embedBuilder],
        components: actionRows,
    };
}

export async function finishRound(id: string) {
    const document = await quoteGuesserModel.findById(id).exec();
    if (document === null) {
        return; // Game not found
    }
}

function quoteGuesserMessage(id: string, quote: string, round: number, answers: number, options: Dict<string>): [EmbedBuilder, ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[]] {
    let answersText = "No one answered yet";
    if (answers > 0) {
        answersText = `${answers} ${answers === 1 ? "person has" : "people have"} answered`;
    }

    const embedBuilder = new EmbedBuilder()
        .setAuthor({ name: `Quote Guesser - Round ${round}` })
        .setTitle("Who said this quote?")
        .setDescription(`"${quote}" - ???`)
        .setFooter({ text: answersText });

    const buttonRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`quote-guesser-finish-${id}`)
                .setLabel("Finish Round")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`quote-guesser-stop-${id}`)
                .setLabel("Stop Game")
                .setStyle(ButtonStyle.Danger),
        ) as ActionRowBuilder<ButtonBuilder>;

    const selectionRow = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`quote-guesser-answer-test`)
                .setPlaceholder("Select the correct answer")
                .addOptions(Object.entries(options).map(([lowered, name]) => {
                    return { label: name, value: lowered };
                }))
        ) as ActionRowBuilder<StringSelectMenuBuilder>;

    return [embedBuilder, [buttonRow, selectionRow]];
}

function roundResultsMessage(results: [[string, string]], round: number, quote: string, author: string): [EmbedBuilder, ActionRowBuilder<ButtonBuilder>] {
    author = author.toLowerCase();
    let correctAnswers = 0;
    for (const [_, answer] of results) {
        if (answer === author) {
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
            return { name: `${name}'s answer`, value: `${answer} ${answer === author ? "✅" : "❌"}`};
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

    return [ embedBuilder, actionRow ];
}
