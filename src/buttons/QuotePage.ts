import { ButtonInteraction, Client, ButtonBuilder, APIButtonComponent, ActionRowBuilder, InteractionUpdateOptions } from 'discord.js';
import { Button } from '../InteractionInterface';
import quoteSchema from '../models/quoteSchema';
import { isGuildCommand } from '../Essentials';
import quoteListSchema from '../models/quoteListSchema';
import { quoteListEmbed } from '../commands/Quote';

export const QuotePage: Button = {
    name: "quotePage",
    run: async (client: Client, interaction: ButtonInteraction, data: string[]) => {
        if (!isGuildCommand(interaction)) return;

        const quoteListDocument = await quoteListSchema.findById(data[1]);

        if (!quoteListDocument) {
            await interaction.update({
                content: "Error: Quote list not found",
                components: [],
                embeds: []
            });
            return;
        }

        const quoteChunks = await quoteSchema.listQuotes(interaction.guildId!, 10,
            quoteListDocument.content,
            quoteListDocument.authorId,
            quoteListDocument.authorName,
            quoteListDocument.creatorId,
            quoteListDocument.creatorName,
            quoteListDocument.date);

        if (quoteChunks.length === 0) {
            await interaction.update({
                content: "Error: No quotes found",
                components: [],
                embeds: []
            });
            return;
        }

        if (data[0] === "next") {
            quoteListDocument.page++;
        } else {
            quoteListDocument.page--;
        }

        await quoteListDocument.save();

        const messageEmbed = quoteListEmbed(quoteChunks, quoteListDocument.page);

        if (!interaction.message.components) {
            await interaction.update({
                content: "Error: No buttons found",
                components: [],
                embeds: []
            });
            return;
        }

        const previousPageButton = interaction.message.components![0].components[0];
        const nextPageButton = interaction.message.components![0].components[1];

        const prevButtonBuilder = ButtonBuilder.from(previousPageButton as APIButtonComponent).setDisabled(quoteListDocument.page === 0);
        const nextButtonBuilder = ButtonBuilder.from(nextPageButton as APIButtonComponent).setDisabled(quoteListDocument.page === quoteChunks.length - 1);

        const row = new ActionRowBuilder()
            .addComponents(prevButtonBuilder, nextButtonBuilder);

        await interaction.update({
            embeds: [messageEmbed],
            components: [row]
        } as InteractionUpdateOptions);
    }
}