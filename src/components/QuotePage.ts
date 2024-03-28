import { debug } from "../Log";
import { Component, ReplyType, Response } from '../Interactions';
import { UnknownQuotePageDataFailure } from "../Failure";
import { ButtonInteraction, ComponentType } from "discord.js";
import { getQuoteList } from "../models/quoteList";
import { getQuotes } from "../models/quote";
import { quoteListMessage } from "../commands/Quote";
import { RawStatistic } from "../models/statistic";
import statisticKeys from "../../data/statistic-keys.json";

export const QuoteListNext: Component<ButtonInteraction> = {
    name: "quote-page",
    type: ComponentType.Button,
    run: async (client, interaction, botUser, data) => {
        debug("QuoteListNext component called");

        const statistic: RawStatistic = {
            global: false,
            key: statisticKeys.bot.event.interaction.component.quotePage,
            userId: botUser.id,
        };

        const quoteList = await getQuoteList(data[1]);
        const quotes = await getQuotes(botUser);

        if (quoteList === null) {
            return new UnknownQuotePageDataFailure();
        }

        switch (data[0]) {
            case "next":
                if (quoteList.page + 1 < quotes.length) {
                    quoteList.page++;
                }
                break;
            case "previous":
                if (quoteList.page > 0) {
                    quoteList.page--;
                }
                break;
            default:
                return new UnknownQuotePageDataFailure();
        }

        const { embedBuilder, actionRow } = quoteListMessage(quoteList, quotes);

        const response: Response = {
            replyType: ReplyType.Update,
            embeds: [embedBuilder],
            components: [actionRow],
        };

        return { response, statistic };
    },
};
