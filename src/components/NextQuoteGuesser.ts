import { ButtonInteraction, Client } from 'discord.js';
import { Button } from '../InteractionInterface';
import { isGuildCommand } from '../Essentials';
import { noGuildError } from '../InteractionReplies';
import quoteGuesserSchema from '../models/quoteGuesserSchema';
import { findCurrentRound } from '../models/quoteGuesserSchema';
import { stopRound } from './StopQuoteGuesser';
import { newGame } from '../commands/QuoteGuesser';

export const NextQuoteGuesser: Button = {
    name: "nextQuoteGuesser",
    isButton: true,
    run: async (client: Client, interaction: ButtonInteraction, data: string[]) => {
        if (!isGuildCommand(interaction)) {
            await interaction.reply(noGuildError);
            return;
        }

        const token = data[0];
        const newRound = await findCurrentRound(quoteGuesserSchema, interaction.guildId!, token) + 1;

        await stopRound(interaction, token);

        const answer = await newGame(interaction, token, newRound);

        interaction.followUp(answer);
    }
}
