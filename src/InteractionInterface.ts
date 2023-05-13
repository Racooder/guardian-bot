import { CommandInteraction, ChatInputApplicationCommandData, Client, ButtonInteraction } from "discord.js";

export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction) => void;
}

export interface Button {
    name: string;
    run: (client: Client, interaction: ButtonInteraction, data: string[]) => void;
}
