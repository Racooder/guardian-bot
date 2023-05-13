import { CommandInteraction, Client, ApplicationCommandType, InteractionResponse, EmbedBuilder } from "discord.js";
import { Command } from "../InteractionInterface";

export const Ping: Command = {
    name: "ping",
    description: "A ping command",
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        const latency = Date.now() - interaction.createdTimestamp; // For some reason this is positive, even though it should be negative
        const apiLatency = client.ws.ping;

        let latencyMessage = "";
        if (latency === 69) {
            latencyMessage = "(Nice)";
        } else if (latency === 420) {
            latencyMessage = "(Blaze it)";
        } else if (latency === 0) {
            latencyMessage = "(Who's your ISP?)";
        } else if (latency < 0) {
            latencyMessage = "(How?)";
        } else if (latency > 10000) {
            latencyMessage = "(Wow, that's bad!)";
        } else if (latency > 1000) {
            latencyMessage = "(That's a lot!)";
        }
        let apiLatencyMessage = "";
        if (apiLatency === 69) {
            latencyMessage = "(Nice)";
        } else if (apiLatency === 420) {
            latencyMessage = "(Blaze it)";
        } else if (apiLatency === 0) {
            latencyMessage = "(Who's your ISP?)";
        } else if (apiLatency < 0) {
            latencyMessage = "(How?)";
        } else if (apiLatency > 10000) {
            apiLatencyMessage = "(Wow, that's bad!)";
        } else if (apiLatency > 1000) {
            apiLatencyMessage = "(That's a lot!)";
        }

        const messageEmbed = new EmbedBuilder()
            .addFields(
                {
                    name: ":stopwatch: Latency",
                    value: `${latency}ms ${latencyMessage}`
                },
                {
                    name: ":heartbeat: API Latency",
                    value: apiLatency < 0 ? "Could not be calculated" : `${apiLatency}ms ${apiLatencyMessage}`
                }
            )

        await interaction.reply({
            ephemeral: true,
            embeds: [messageEmbed]
        });
    }
};
