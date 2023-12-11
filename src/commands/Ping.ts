import { ApplicationCommandType, EmbedBuilder } from "discord.js";
import { Command } from "../Interactions";
import { debug } from "../Log";

export const Ping: Command = {
    name: "ping",
    description: "A ping command",
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        debug("Ping command called");

        const latency = Date.now() - interaction.createdTimestamp;
        const apiLatency = client.ws.ping;

        const latencySuffix = getLatencySuffix(latency);
        const apiLatencySuffix = getLatencySuffix(apiLatency);

        const embed = new EmbedBuilder().addFields(
            {
                name: ":stopwatch: Latency",
                value: `${latency}ms ${latencySuffix}`,
            },
            {
                name: ":heartbeat: API Latency",
                value: apiLatency < 0
                    ? "Couldn't be calculated"
                    : `${apiLatency}ms ${apiLatencySuffix}`,
            }
        );

        // TODO: Update statistics

        return {
            initial: true,
            embeds: [embed],
            ephemeral: true,
        };
    },
};

function getLatencySuffix(latency: number): string {
    // Special cases:
    switch (latency) {
        case 69:
            return "(Nice)";
        case 420:
            return "(Blaze it)";
        case 0:
            return "(Who's your ISP?)";
    }

    // Ranges:
    if (latency < 0) {
        return "(How?)";
    }
    if (latency > 10000) {
        return "(Are you on a potato?)";
    }
    if (latency > 1000) {
        return "(That's pretty bad)";
    }

    // Default:
    return "";
}
