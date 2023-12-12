import { ButtonInteraction, ChatInputApplicationCommandData, Client, CommandInteraction, InteractionReplyOptions, MessageComponentInteraction, StringSelectMenuInteraction } from "discord.js";
import { Ping } from "./commands/Ping";
import { Kofi } from "./commands/Kofi";
import { RawStatistic, Statistic } from "./models/statistic";

export const Commands: Command[] = [Ping, Kofi];

export const Components: Component[] = [];

export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction) => Promise<{response: SlashCommandResponse, statistic: RawStatistic}>;
}

export enum ComponentType {
    Button,
    StringSelectMenu,
}

export interface Component<InteractionType = MessageComponentInteraction> {
    name: string;
    type: ComponentType;
    run: (client: Client, interaction: InteractionType, data: string[]) => Promise<ComponentResponse>;
}

export interface ButtonComponent extends Component<ButtonInteraction> {
    type: ComponentType.Button;
}

export interface StringSelectMenuComponent extends Component<StringSelectMenuInteraction> {
    type: ComponentType.StringSelectMenu;
}

export interface SlashCommandResponse extends InteractionReplyOptions {
    initial: boolean;
}

export interface ComponentResponse extends InteractionReplyOptions {
    update: boolean;
}
