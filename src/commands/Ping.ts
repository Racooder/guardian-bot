import {
    CommandInteraction,
    Client,
    ApplicationCommandType,
    EmbedBuilder,
} from "discord.js";
import { Command } from "../InteractionInterfaces";
import { debug } from "../Log";
import { StatisticType, updateStatistic } from "../models/statisticsSchema";

export const Ping: Command = {
    name: "ping",
    description: "A ping command",
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        debug("Ping command called");

        const latency = Date.now() - interaction.createdTimestamp;
        const apiLatency = client.ws.ping;
        debug(`Latency: ${latency}ms, API latency: ${apiLatency}ms`);

        debug("Getting latency messages");
        const latencyMessage = getLatencyMessage(latency);
        const apiLatencyMessage = getLatencyMessage(apiLatency);

        debug("Building embed");
        const messageEmbed = new EmbedBuilder().addFields(
            {
                name: ":stopwatch: Latency",
                value: `${latency}ms ${latencyMessage}`,
            },
            {
                name: ":heartbeat: API Latency",
                value:
                    apiLatency < 0
                        ? "Could not be calculated"
                        : `${apiLatency}ms ${apiLatencyMessage}`,
            }
        );

        await interaction.reply({
            ephemeral: true,
            embeds: [messageEmbed],
        });

        updateStatistic([StatisticType.Command_Ping]);
    },
};

export const getLatencyMessage = (latency: number): String => {
    if (latency === 69) {
        return "(Nice)";
    }
    if (latency === 420) {
        return "(Blaze it)";
    }
    if (latency === 0) {
        return "(Who's your ISP?)";
    }
    if (latency < 0) {
        return "(How?)";
    }
    if (latency > 10000) {
        return "(Wow, that's bad!)";
    }
    if (latency > 1000) {
        return "(That's a lot!)";
    }
    return "";
};
