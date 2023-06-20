import { ButtonInteraction, Client } from 'discord.js';
import { Button } from '../InteractionInterfaces';
import { isGuildCommand } from '../Essentials';
import { noGuildError } from '../InteractionReplies';
import quoteGuesserSchema from '../models/quoteGuesserSchema';
import { findCurrentRound } from '../models/quoteGuesserSchema';
import { stopRound } from './StopQuoteGuesser';
import { newGame } from '../commands/QuoteGuesser';
import { debug } from '../Log';

export const NextQuoteGuesser: Button = {
    name: "nextQuoteGuesser",
    isButton: true,
    run: async (client: Client, interaction: ButtonInteraction, data: string[]) => {
        debug("Next quote guesser button interaction received");

        if (!isGuildCommand(interaction)) {
            await interaction.reply(noGuildError);
            return;
        }

        // Get the token from the button data
        const token = data[0];
        // Get the new round number
        const newRound = await findCurrentRound(quoteGuesserSchema, interaction.guildId!, token) + 1;

        // Stop the current round
        await stopRound(interaction, token);

        // Start a new round
        const answer = await newGame(interaction, token, newRound);

        // Reply with the new game
        interaction.followUp(answer);
    }
}
