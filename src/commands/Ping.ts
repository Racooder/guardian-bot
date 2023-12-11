import { ApplicationCommandType } from "discord.js";
import { Command } from "src/Interactions";

export const Ping: Command = {
    name: "ping",
    description: "A ping command",
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        return {
            content: "Pong!",
        };
    },
};
