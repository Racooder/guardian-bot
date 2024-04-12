import { debug } from "../Log";
import { Component, ReplyType, Response } from '../Interactions';
import { UnknownQuotePageDataFailure } from "../Failure";
import { ButtonInteraction, ComponentType } from "discord.js";
import { getQuoteList } from "../models/quoteList";
import { getQuotes } from "../models/quote";
import { QUOTE_PAGE_SIZE, quoteListMessage } from "../commands/Quote";
import { RawStatistic } from "../models/statistic";
import statisticKeys from "../../data/statistic-keys.json";

export const QuotePage: Component<ButtonInteraction> = {
    name: "quote-page",
    type: ComponentType.Button,
    run: async (client, interaction, botUser, data) => {
        debug("QuotePage component called");

        const statistic: RawStatistic = {
            global: false,
            key: statisticKeys.bot.event.interaction.component.quotePage,
            user: botUser
        };

        const quoteList = await getQuoteList(data[1]);
        const quotes = await getQuotes(botUser);

        if (quoteList === null) {
            return new UnknownQuotePageDataFailure();
        }

        let page: number;
        switch (data[0]) {
            case "first":
                page = 0;
                break;
            case "page":
                page = parseInt(data[2]);
                break;
            case "last":
                page = Math.ceil(quotes.length / QUOTE_PAGE_SIZE) - 1;
                break;
            default:
                return new UnknownQuotePageDataFailure();
        }

        const [embedBuilder, actionRow] = await quoteListMessage(quoteList, quotes, client, page);

        const response: Response = {
            replyType: ReplyType.Update,
            embeds: [embedBuilder],
            components: [actionRow],
        };

        return { response, statistic };
    },
};
