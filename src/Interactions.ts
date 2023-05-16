import { Command, Component } from './InteractionInterface';
import { QuotePage } from "./components/QuotePage";
import { StopQuoteGuesser } from "./components/StopQuoteGuesser";
import { Ping } from "./commands/Ping";
import { Quote } from "./commands/Quote";
import { QuoteGuesser } from "./commands/QuoteGuesser";
import { Settings } from "./commands/Settings";
import { NextQuoteGuesser } from './components/NextQuoteGuesser';
import { AnswerQuoteGuesser } from './components/AnswerQuoteGuesser';

export const Commands: Command[] = [Ping, Quote, Settings, QuoteGuesser];

export const Components: Component[] = [QuotePage, StopQuoteGuesser, NextQuoteGuesser, AnswerQuoteGuesser];
