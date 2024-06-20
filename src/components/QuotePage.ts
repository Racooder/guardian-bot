import { debug } from "../Log";
import { Component, ReplyType } from '../InteractionEssentials';
import { UnknownQuotePageDataFailure } from "../Failure";
import { ButtonInteraction, ComponentType } from "discord.js";
import { getQuoteList } from "../models/quoteList";
import { getQuotes } from "../models/quote";
import { QUOTE_PAGE_SIZE, quoteListMessage } from "../commands/Quote";
import { clamp } from "../Essentials";

export const QuotePage: Component<ButtonInteraction> = {
    name: "quote_page",
    type: ComponentType.Button,
    run: async (client, interaction, botUser, data) => {
        debug("QuotePage component called");

        const quoteList = await getQuoteList(data[1]);
        const quotes = await getQuotes(botUser);

        if (quoteList === null) {
            return new UnknownQuotePageDataFailure();
        }

        const lastPage = Math.ceil(quotes.length / QUOTE_PAGE_SIZE) - 1;

        let page: number;
        switch (data[0]) {
            case "first":
                page = 0;
                break;
            case "page":
                page = clamp(parseInt(data[2]), 0, lastPage);
                break;
            case "last":
                page = lastPage;
                break;
            default:
                return new UnknownQuotePageDataFailure();
        }

        return await quoteListMessage(quoteList, quotes, client, page, ReplyType.Update);
    },
};
