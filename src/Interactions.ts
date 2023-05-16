import { Command, Component } from './InteractionInterface';
import { QuotePage } from "./components/QuotePage";
import { StopQuoteGuesser } from "./components/StopQuoteGuesser";
import { Ping } from "./commands/Ping";
import { Quote } from "./commands/Quote";
import { QuoteGuesser } from "./commands/QuoteGuesser";
import { Settings } from "./commands/Settings";
import { NextQuoteGuesser } from './components/NextQuoteGuesser';
import { AnswerQuoteGuesser } from './components/AnswerQuoteGuesser';

/**
 * A list of all commands that are handled by the bot.
 */
export const Commands: Command[] = [Ping, Quote, Settings, QuoteGuesser];

/**
 * A list of all components that are handled by the bot.
 */
export const Components: Component[] = [QuotePage, StopQuoteGuesser, NextQuoteGuesser, AnswerQuoteGuesser];
