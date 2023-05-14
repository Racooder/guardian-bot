import { CommandInteraction, ChatInputApplicationCommandData, Client, ButtonInteraction, StringSelectMenuInteraction } from "discord.js";

export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction) => void;
}

export interface Component {
    name: string;
    isButton?: boolean;
    isStringSelectMenu?: boolean;
}

export interface Button extends Component {
    run: (client: Client, interaction: ButtonInteraction, data: string[]) => void;
    isButton: true;
}

export interface StringSelectMenu extends Component {
    run: (client: Client, interaction: StringSelectMenuInteraction, data: string[]) => void;
    isStringSelectMenu: true;
}
