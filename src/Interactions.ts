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

export interface Component {
    name: string;
    type: ComponentType;
}

export interface ButtonComponent extends Component {
    type: ComponentType.Button;
    run: (client: Client, interaction: ButtonInteraction, data: string[]) => void;
}

export interface StringSelectMenuComponent extends Component {
    type: ComponentType.StringSelectMenu;
    run: (client: Client, interaction: StringSelectMenuInteraction, data: string[]) => void;
}
