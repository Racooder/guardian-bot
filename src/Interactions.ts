import { ChatInputApplicationCommandData, ChatInputCommandInteraction, Client, CommandInteraction, ComponentType, InteractionReplyOptions, MessageComponentInteraction } from "discord.js";
import { Ping } from "./commands/Ping";
import { Donate } from "./commands/Donate";
import { RawStatistic } from "./models/statistic";
import { BotUser } from './models/botUser';
import { Codenames } from "./commands/Codenames";
import { Feedback } from "./commands/Feedback";
import { Quote } from "./commands/Quote";
import { QuoteGuesser } from "./commands/QuoteGuesser";
import { Settings } from "./commands/Settings";
import { Failure } from "./Failure";
import { QuotePage } from "./components/QuotePage";

export const Commands: Command[] = [Codenames, Feedback, Donate, Ping, Quote, QuoteGuesser, Settings];

export const Components: Component<any>[] = [QuotePage];

export type SlashCommandReturnType = {response: Response, statistic: RawStatistic};
export type ComponentReturnType = {response: Response, statistic: RawStatistic};

export enum ReplyType {
    Reply,
    FollowUp,
    Update,
}

export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction, botUser: BotUser) => Promise<SlashCommandReturnType | Failure>;
    subcommands?: {
        [key: string]: (client: Client, interaction: ChatInputCommandInteraction, botUser: BotUser) => Promise<SlashCommandReturnType | Failure>;
    }
}

export interface Component<InteractionType = MessageComponentInteraction> {
    name: string;
    type: ComponentType;
    run: (client: Client, interaction: InteractionType, botUser: BotUser, data: string[]) => Promise<ComponentReturnType | Failure>;
}

export interface Response extends InteractionReplyOptions {
    replyType: ReplyType;
}
