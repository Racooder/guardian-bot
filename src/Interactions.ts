import { Button, Command } from "./InteractionInterface";
import { QuotePage } from "./buttons/QuotePage";
import { StopQuoteGuesser } from "./buttons/StopQuoteGuesser";
import { Ping } from "./commands/Ping";
import { Quote } from "./commands/Quote";
import { QuoteGuesser } from "./commands/QuoteGuesser";
import { Settings } from "./commands/Settings";

export const Commands: Command[] = [Ping, Quote, Settings, QuoteGuesser];

export const Buttons: Button[] = [QuotePage, StopQuoteGuesser];
