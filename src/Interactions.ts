import { Button, Command } from "./InteractionInterface";
import { QuotePage } from "./buttons/QuotePage";
import { Ping } from "./commands/Ping";
import { Quote } from "./commands/Quote";
import { Settings } from "./commands/Settings";

export const Commands: Command[] = [Ping, Quote, Settings];

export const Buttons: Button[] = [QuotePage];
