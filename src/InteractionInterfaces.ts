import { CommandInteraction, ChatInputApplicationCommandData, Client, ButtonInteraction, StringSelectMenuInteraction } from "discord.js";

/**
 * A command that can be handled by the bot.
 */
export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction) => void;
}

/**
 * The base interface for all components.
 */
export interface Component {
    name: string;
    isButton?: boolean;
    isStringSelectMenu?: boolean;
}

/**
 * A button that can be handled by the bot.
 */
export interface Button extends Component {
    run: (client: Client, interaction: ButtonInteraction, data: string[]) => void;
    isButton: true;
}

/**
 * A string select menu that can be handled by the bot.
 */
export interface StringSelectMenu extends Component {
    run: (client: Client, interaction: StringSelectMenuInteraction, data: string[]) => void;
    isStringSelectMenu: true;
}
