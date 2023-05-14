import { ButtonInteraction, Client, EmbedBuilder, InteractionUpdateOptions } from 'discord.js';
import { Button } from '../InteractionInterface';
import quoteGuesserSchema from '../models/quoteGuesserSchema';
import { isGuildCommand } from '../Essentials';
import { noGuildError } from '../InteractionReplies';

export const StopQuoteGuesser: Button = {
    name: "stopQuoteGuesser",
    run: async (client: Client, interaction: ButtonInteraction, data: string[]) => {
        if (!isGuildCommand(interaction)) {
            await interaction.reply(noGuildError);
            return;
        }

        const quoteGuesserDocument = await quoteGuesserSchema.findOne({ guildId: interaction.guildId, token: data[0] });

        if (!quoteGuesserDocument) {
            await interaction.update({ content: "This game doesn't exist anymore", embeds: [], components: [] });
            return;
        }

        const messageEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
        messageEmbed.setTitle("Quote Guesser");
        messageEmbed.setDescription(`"${quoteGuesserDocument.quote}" - ${quoteGuesserDocument.authorName}`);
        messageEmbed.setFooter({ text: "This game has been stopped" });
        messageEmbed.setTimestamp(Math.floor(Date.now() / 1000));

        for (const correctAnswerName of quoteGuesserDocument.correctAnswerNames) {
            messageEmbed.addFields({ name: "Correct Answer", value: correctAnswerName });
        }
        for (const wrongAnswerName of quoteGuesserDocument.wrongAnswerNames) {
            messageEmbed.addFields({ name: "Wrong Answer", value: wrongAnswerName });
        }

        await interaction.update({ 
            embeds: [messageEmbed],
            components: []
        } as InteractionUpdateOptions);

        await quoteGuesserDocument.deleteOne();
    }
}