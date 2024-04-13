import { ChatInputApplicationCommandData, ChatInputCommandInteraction, Client, CommandInteraction, ComponentType, InteractionReplyOptions, MessageComponentInteraction } from "discord.js";
import { Failure } from "./Failure";
import { BotUser } from './models/botUser';
import { RawStatistic } from "./models/statistic";
import { Ping } from "./commands/Ping";
import { Donate } from "./commands/Donate";
import { Codenames } from "./commands/Codenames";
import { Feedback } from "./commands/Feedback";
import { Quote } from "./commands/Quote";
import { QuoteGuesser } from "./commands/QuoteGuesser";
import { Connections } from "./commands/Connections";
import { QuotePage } from "./components/QuotePage";
import { QuoteGuesserComponent } from "./components/QuoteGuesserComponent";
import { FollowMenu } from "./components/FollowMenu";

export const Commands: Command[] = [Codenames, Feedback, Donate, Ping, Quote, QuoteGuesser, Connections];

export const Components: Component<any>[] = [QuotePage, QuoteGuesserComponent, FollowMenu];

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
