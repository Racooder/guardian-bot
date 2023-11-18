import { ButtonInteraction, Client } from "discord.js";
import { Button } from "../InteractionInterfaces";
import { isGuildCommand } from "../Essentials";
import { noGuildError } from "../InteractionReplies";
import { stopRound } from "./StopQuoteGuesser";
import { newGame } from "../commands/QuoteGuesser";
import { debug } from "../Log";
import { StatisticKey, updateStatistic } from "../models/statistic";

export const NextQuoteGuesser: Button = {
    name: "nextQuoteGuesser",
    isButton: true,
    run: async (
        client: Client,
        interaction: ButtonInteraction,
        data: string[]
    ) => {
        debug("Next quote guesser button interaction received");

        if (!isGuildCommand(interaction)) {
            await interaction.reply(noGuildError);
            return;
        }

        // Get the token from the button data
        const token = data[0];
        // Get the new round number
        const newRound =
            (await findCurrentRound(
                quoteGuesserSchema,
                interaction.guildId!,
                token
            )) + 1;

        debug("Stopping round");
        await stopRound(interaction, token);

        debug("Starting new round");
        const answer = await newGame(interaction, token, newRound);

        debug("Replying to user");
        interaction.followUp(answer);

        updateStatistic(StatisticKey.Component.QuoteGuesser.Next);
    },
};
