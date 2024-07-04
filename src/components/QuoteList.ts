import { debug } from "../Log";
import { Component, ReplyType } from '../InteractionEssentials';
import { UnknownQuotePageDataFailure } from "../Failure";
import { ButtonInteraction, ComponentType } from "discord.js";
import { getQuoteList } from "../models/quoteList";
import { getQuotes } from "../models/quote";
import { QUOTE_PAGE_SIZE, quoteListMessage } from "../commands/Quote";
import { clamp } from "../Essentials";

export const QuoteList: Component<ButtonInteraction> = {
    name: "quote_list",
    type: ComponentType.Button,
    subcomponents: {
        page: {
            run: async (client, interaction, botUser, data) => {
                debug("QuotePage page button pressed");

                const quoteList = await getQuoteList(data[1]);
                const quotes = await getQuotes(botUser);
                const lastPage = Math.ceil(quotes.length / QUOTE_PAGE_SIZE) - 1;

                if (quoteList === null) {
                    return new UnknownQuotePageDataFailure();
                }

                let page = clamp(parseFloat(data[2]), 0, lastPage);
                return quoteListMessage(quoteList, quotes, client, page, ReplyType.Update);
            },
        }
    }
};
