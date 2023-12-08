import { ButtonInteraction, ChatInputApplicationCommandData, Client, CommandInteraction, MessageComponentInteraction, StringSelectMenuInteraction } from "discord.js";

export const Commands: Command[] = [];

export const Components: Component[] = [];

export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction) => void;
}

export enum ComponentType {
    Button,
    StringSelectMenu,
}

export interface Component<InteractionType = MessageComponentInteraction> {
    name: string;
    type: ComponentType;
    run: (client: Client, interaction: InteractionType, data: string[]) => void;
}

export interface ButtonComponent extends Component<ButtonInteraction> {
    type: ComponentType.Button;
}

export interface StringSelectMenuComponent extends Component<StringSelectMenuInteraction> {
    type: ComponentType.StringSelectMenu;
}
