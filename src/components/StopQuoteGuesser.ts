import { ButtonInteraction, Client, EmbedBuilder, InteractionUpdateOptions } from 'discord.js';
import { Button } from '../InteractionInterfaces';
import quoteGuesserSchema, { findCurrentRound } from '../models/quoteGuesserSchema';
import { isGuildCommand } from '../Essentials';
import { noGuildError } from '../InteractionReplies';
import guildSchema, { guildSettings } from '../models/guildSchema';
import { debug } from '../Log';
import { StatisticType, updateStatistic } from '../models/statisticsSchema';

export const StopQuoteGuesser: Button = {
    name: "stopQuoteGuesser",
    isButton: true,
    run: async (client: Client, interaction: ButtonInteraction, data: string[]) => {
        debug("Stop quote guesser button interaction received");

        if (!isGuildCommand(interaction)) {
            await interaction.reply(noGuildError);
            return;
        }

        // Get the token from the button data
        const token = data[0];

        await stopRound(interaction, token);

        debug("Building leaderboard");
        const rounds = await quoteGuesserSchema.find({ guildId: interaction.guildId, token: token });
        let leaderboard: Map<string, number> = new Map();
        // Add the points of each round to the leaderboard
        for (const round of rounds) {
            // For each correct answer, add one point
            for (const correctAnswerName of round.correctAnswerNames) {
                const newPoints = (leaderboard.get(correctAnswerName) ?? 0) + 1;
                leaderboard.set(correctAnswerName, newPoints);
            }
            // Add the wrong answer names to the leaderboard if they don't exist
            for (const wrongAnswerName of round.wrongAnswerNames) {
                if (!leaderboard.has(wrongAnswerName)) {
                    leaderboard.set(wrongAnswerName, 0);
                }
            }
        }
        // Sort the leaderboard and convert it to an array
        let ranking = [...leaderboard.entries()].sort((a, b) => b[1] - a[1]);

        debug("Creating embed")
        const rankingEmbed = new EmbedBuilder()
            .setTitle("Game Leaderboard");

        // Add the ranking to the embed
        for (const [user, points] of ranking) {
            rankingEmbed.addFields({ name: user, value: points.toString() });
        }

        debug("Sending embed");
        interaction.followUp({ embeds: [rankingEmbed] });

        debug("Deleting game from database");
        await quoteGuesserSchema.deleteMany({ guildId: interaction.guildId, token: token });

        updateStatistic([StatisticType.Component, StatisticType.Component_QuoteGuesser, StatisticType.Component_QuoteGuesser_Stop]);
    }
}

/**
 * Stops a quote guesser game
 * @param interaction - The button interaction
 * @param token - The token of the game
 */
export const stopRound = async (interaction: ButtonInteraction, token: string): Promise<void> => {
    debug(`Stopping quote guesser game ${token} in guild ${interaction.guild!.name}(${interaction.guildId})`);
    debug("Getting current game from the database");
    const round = await findCurrentRound(quoteGuesserSchema, interaction.guildId!, token);
    const quoteGuesserDocument = await quoteGuesserSchema.findOne({ guildId: interaction.guildId, token: token, round: round });

    // Check if the game exists
    if (!quoteGuesserDocument) {
        await interaction.update({ content: "This game doesn't exist anymore", embeds: [], components: [] });
        return;
    }

    debug("Updating embed")
    const messageEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
    messageEmbed.setTitle("Quote Guesser");
    messageEmbed.setDescription(`"${quoteGuesserDocument.quote}" - ${quoteGuesserDocument.authorName}`);
    messageEmbed.setFooter({ text: "This game has been stopped" });
    messageEmbed.setTimestamp(Date.now());

    debug("Adding answers to embed");
    for (const correctAnswerName of quoteGuesserDocument.correctAnswerNames) {
        messageEmbed.addFields({ name: correctAnswerName, value: "answered correct!" });
    }
    for (const wrongAnswerName of quoteGuesserDocument.wrongAnswerNames) {
        messageEmbed.addFields({ name: wrongAnswerName, value: "answered wrong!" });
    }

    debug("Updating message");
    await interaction.update({ 
        embeds: [messageEmbed]
    });

    debug("Deleting message after timeout");
    setTimeout(async () => {
        interaction.deleteReply();
    }, await guildSettings.quoteGuesserSolutionTimeout(guildSchema, interaction.guildId!) * 1000);
}
