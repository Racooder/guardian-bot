import { ButtonInteraction, Client, EmbedBuilder, InteractionUpdateOptions } from 'discord.js';
import { Button } from '../InteractionInterface';
import quoteGuesserSchema, { findCurrentRound } from '../models/quoteGuesserSchema';
import { isGuildCommand } from '../Essentials';
import { noGuildError } from '../InteractionReplies';
import guildSchema from '../models/guildSchema';

export const StopQuoteGuesser: Button = {
    name: "stopQuoteGuesser",
    isButton: true,
    run: async (client: Client, interaction: ButtonInteraction, data: string[]) => {
        if (!isGuildCommand(interaction)) {
            await interaction.reply(noGuildError);
            return;
        }

        const token = data[0];

        await stopRound(interaction, token);

        const rounds = await quoteGuesserSchema.find({ guildId: interaction.guildId, token: token });
        let leaderboard: Map<string, number> = new Map();
        for (const round of rounds) {
            for (const correctAnswerName of round.correctAnswerNames) {
                const newPoints = (leaderboard.get(correctAnswerName) ?? 0) + 1;
                leaderboard.set(correctAnswerName, newPoints);
            }
            for (const wrongAnswerName of round.wrongAnswerNames) {
                if (!leaderboard.has(wrongAnswerName)) {
                    leaderboard.set(wrongAnswerName, 0);
                }
            }
        }

        let ranking = [...leaderboard.entries()].sort((a, b) => b[1] - a[1]);

        const rankingEmbed = new EmbedBuilder()
            .setTitle("Game Leaderboard");

        for (const [user, points] of ranking) {
            rankingEmbed.addFields({ name: user, value: points.toString() });
        }

        interaction.followUp({ embeds: [rankingEmbed] });

        await quoteGuesserSchema.deleteMany({ guildId: interaction.guildId, token: token });
    }
}

export const stopRound = async (interaction: ButtonInteraction, token: string) => {
    const round = await findCurrentRound(quoteGuesserSchema, interaction.guildId!, token);
    const quoteGuesserDocument = await quoteGuesserSchema.findOne({ guildId: interaction.guildId, token: token, round: round });

    if (!quoteGuesserDocument) {
        await interaction.update({ content: "This game doesn't exist anymore", embeds: [], components: [] });
        return;
    }

    const messageEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
    messageEmbed.setTitle("Quote Guesser");
    messageEmbed.setDescription(`"${quoteGuesserDocument.quote}" - ${quoteGuesserDocument.authorName}`);
    messageEmbed.setFooter({ text: "This game has been stopped" });
    messageEmbed.setTimestamp(Date.now());

    for (const correctAnswerName of quoteGuesserDocument.correctAnswerNames) {
        messageEmbed.addFields({ name: "Correct Answer", value: correctAnswerName });
    }
    for (const wrongAnswerName of quoteGuesserDocument.wrongAnswerNames) {
        messageEmbed.addFields({ name: "Wrong Answer", value: wrongAnswerName });
    }

    await interaction.update({ 
        embeds: [messageEmbed]
    });

    setTimeout(async () => {
        interaction.deleteReply();
    }, (await guildSchema.getGuildSettings(interaction.guildId!)).quoteGuesserSolutionTimeout.value * 1000);
}
