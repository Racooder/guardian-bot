import { Button, Command } from "./InteractionInterface";
import { QuotePage } from "./buttons/QuotePage";
import { Ping } from "./commands/Ping";
import { Quote } from "./commands/Quote";

export const Commands: Command[] = [Ping, Quote];

export const Buttons: Button[] = [QuotePage];
