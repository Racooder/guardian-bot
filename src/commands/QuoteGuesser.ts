import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { Command, ReplyType, Response } from "../Interactions";
import { debug } from "../Log";
import statisticKeys from "../../data/statistic-keys.json"
import { RawStatistic } from "../models/statistic";
import quoteGuesserModel, { createQuoteGuesserGame, QuoteGuesserGame } from "../models/quoteGuesser";
import { shuffleArray } from "../Essentials";
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

        const response = await newRound(botUser);

        return { response, statistic };
    },
};

export async function newRound(botUser: BotUser, document?: QuoteGuesserGame): Promise<Response>{
    debug("Starting new round");

    const [quote, authors, correctAuthor] = await randomQuote(botUser, document?.usedQuotes);
    if (quote === undefined) {
        return {
            replyType: ReplyType.Reply,
            ephemeral: true,
            content: "No quotes left to guess",
        };
    }
    if (correctAuthor === undefined) {
        return {
            replyType: ReplyType.Reply,
            ephemeral: true,
            content: "Quote author not found",
        };
    }
    if (authors === undefined) {
        return {
            replyType: ReplyType.Reply,
            ephemeral: true,
            content: "No authors found",
        };
    }

    if (document === undefined) {
        document = await createQuoteGuesserGame(quote, authors, correctAuthor);
    } else {
        document.currentQuote = quote;
        document.usedQuotes.push(quote._id);
        document.choices = authors;
        document.correctAuthor = correctAuthor;
        document.answers.clear();
        await document.save();
    }

    const [embedBuilders, actionRows] = quoteGuesserMessage(document, quote.statements[0]);

    return {
        replyType: ReplyType.Reply,
        embeds: embedBuilders,
        components: actionRows,
    };
}

export async function finishRound(id: string) {
    debug("Finishing round");

    const document = await quoteGuesserModel.findById(id).exec();
    if (document === null) {
        return; // Game not found
    }
}

export function quoteGuesserMessage(document: QuoteGuesserGame, quote: string): [EmbedBuilder[], ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[]] {
    debug("Creating quote guesser message");

    const id = document._id;
    const round = document.usedQuotes.length;
    const choices = document.choices;
    const correctAuthor = document.correctAuthor;
    const answerCount = document.answers.size;

    let answersText = "No one answered yet";
    if (answerCount > 0) {
        answersText = `${answerCount} ${answerCount === 1 ? "person has" : "people have"} answered`;
    }

    const embedBuilder = new EmbedBuilder()
        .setAuthor({ name: `Quote Guesser - Round ${round}` })
        .setTitle("Who said this quote?")
        .setDescription(`"${quote}" - ???`)
        .setFooter({ text: answersText });

    const buttonRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`quote-guesser:finish:${id}`)
                .setLabel("Finish Round")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`quote-guesser:end:${id}`)
                .setLabel("End Game")
                .setStyle(ButtonStyle.Danger),
        ) as ActionRowBuilder<ButtonBuilder>;

    // Shuffle authors and add the correct author
    const options = shuffleArray<[string, string]>(Array.from(choices.entries())).slice(0, 24);
    options.splice(Math.floor(Math.random() * options.length), 0, correctAuthor);

    const selectionRow = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`quote-guesser:answer:${id}`)
                .setPlaceholder("Select the correct answer")
                .addOptions(options.map(([lowered, name]) => {
                    return { label: name, value: lowered };
                }))
                .setMinValues(1)
                .setMaxValues(1),
        ) as ActionRowBuilder<StringSelectMenuBuilder>;

    return [[embedBuilder], [buttonRow, selectionRow]];
}
