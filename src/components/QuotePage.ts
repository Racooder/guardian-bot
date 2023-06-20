import { ButtonInteraction, Client, ButtonBuilder, APIButtonComponent, ActionRowBuilder, InteractionUpdateOptions } from 'discord.js';
import { Button } from '../InteractionInterfaces';
import quoteSchema from '../models/quoteSchema';
import { isGuildCommand } from '../Essentials';
import quoteListSchema from '../models/quoteListSchema';
import { quoteListEmbed } from '../commands/Quote';
import guildSchema, { guildSettings } from '../models/guildSchema';
import { noGuildError } from '../InteractionReplies';
import { debug, info } from '../Log';

export const QuotePage: Button = {
    name: "quotePage",
    isButton: true,
    run: async (client: Client, interaction: ButtonInteraction, data: string[]) => {
        info("Quote page button interaction received");

        if (!isGuildCommand(interaction)) {
            await interaction.update(noGuildError as InteractionUpdateOptions);
            return;
        };

        // Get the quote list
        const quoteListDocument = await quoteListSchema.findById(data[1]);

        // Check if the quote list exists
        if (!quoteListDocument) {
            await interaction.update({
                content: "This quote list no longer exists!\nPlease create a new one using `/quote list` or `/quote search`.",
                components: [],
                embeds: []
            });
            return;
        }

        // Get the quote chunks by listing all quotes matching the filters stored in the quote list
        const quoteChunks = await quoteSchema.listQuotes(interaction.guildId!, await guildSettings.quoteListPageSize(guildSchema, interaction.guildId!),
            quoteListDocument.content,
            quoteListDocument.authorId,
            quoteListDocument.authorName,
            quoteListDocument.creatorId,
            quoteListDocument.creatorName,
            quoteListDocument.date);

        // Check if there are any quotes
        if (quoteChunks.length === 0) {
            await interaction.update({
                content: "Error: No quotes found",
                components: [],
                embeds: []
            });
            return;
        }

        // Change the page number
        if (data[0] === "next") {
            quoteListDocument.page++;
        } else {
            quoteListDocument.page--;
        }

        // Save the quote list
        await quoteListDocument.save();

        // Create the embed
        const messageEmbed = quoteListEmbed(quoteChunks, quoteListDocument.page);

        // Check if there are any buttons
        if (!interaction.message.components) {
            await interaction.update({
                content: "Error: No buttons found",
                components: [],
                embeds: []
            });
            return;
        }

        // Get the buttons
        const previousPageButton = interaction.message.components![0].components[0];
        const nextPageButton = interaction.message.components![0].components[1];
        const prevButtonBuilder = ButtonBuilder.from(previousPageButton as APIButtonComponent).setDisabled(quoteListDocument.page === 0);
        const nextButtonBuilder = ButtonBuilder.from(nextPageButton as APIButtonComponent).setDisabled(quoteListDocument.page === quoteChunks.length - 1);

        // Create the component row
        const row = new ActionRowBuilder()
            .addComponents(prevButtonBuilder, nextButtonBuilder);

        // Update the message
        await interaction.update({
            embeds: [messageEmbed],
            components: [row]
        } as InteractionUpdateOptions);
    }
}