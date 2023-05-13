import { ButtonInteraction, Client } from 'discord.js';
import { Button } from '../InteractionInterface';
import quoteSchema from '../models/quoteSchema';
import { isGuildCommand } from '../Essentials';
import quoteListSchema from '../models/quoteListSchema';
import { quoteListEmbed } from '../commands/Quote';

export const QuotePage: Button = {
    name: "quotePage",
    run: async (client: Client, interaction: ButtonInteraction, data: string[]) => {
        if (!isGuildCommand(interaction)) return;

        const quotes = await quoteSchema.listQuotes(interaction.guildId!, 2);
        const quoteListDocument = await quoteListSchema.findById(data[1]);

        if (!quoteListDocument) {
            await interaction.update({
                content: "Error: Quote list not found",
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

        const messageEmbed = quoteListEmbed(quotes, quoteListDocument.page);

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

        // previousPageButton.setDisabled(quoteListDocument.page === 0);
        // nextPageButton.setDisabled(quoteListDocument.page === quotes.length - 1);
    }
}