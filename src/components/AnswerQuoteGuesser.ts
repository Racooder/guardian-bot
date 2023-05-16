import { Client, EmbedBuilder, GuildMember, StringSelectMenuInteraction } from 'discord.js';
import { StringSelectMenu } from '../InteractionInterface';
import { isGuildCommand } from '../Essentials';
import { noGuildError } from '../InteractionReplies';
import quoteGuesserSchema, { resultTranslation } from '../models/quoteGuesserSchema';

export const AnswerQuoteGuesser: StringSelectMenu = {
    name: "answerQuoteGuesser",
    isStringSelectMenu: true,
    run: async (client: Client, interaction: StringSelectMenuInteraction, data: string[]) => {
        if (!isGuildCommand(interaction)) {
            await interaction.reply(noGuildError);
            return;
        }

        // Get the token from the button data
        const token = data[0];
        // Get the user from the select menu values
        const user = interaction.values[0] ?? null;

        // Check if a user was selected
        if (user === null) {
            return;
        }

        // Add the answer to the database
        const result = await quoteGuesserSchema.addAnswer(interaction.guildId!, token, interaction.member as GuildMember, user);

        // Check if adding the answer was successful
        if (result === 1 || result === 2) {
            // Update the embed
            const embedBuilder = EmbedBuilder.from(interaction.message.embeds[0]);
            const answerCount = await quoteGuesserSchema.getAnswerCount(interaction.guildId!, token);
            embedBuilder.setFooter({
                text: `Answered by ${answerCount} player${answerCount === 1 ? "" : "s"}`,
            });

            // Update the message
            await interaction.update({
                embeds: [embedBuilder],
            });
        
            // Reply if the answer was correct
            interaction.followUp({ content: resultTranslation[result], ephemeral: true });
        } else {
            // Reply what went wrong
            interaction.reply({ content: resultTranslation[result], ephemeral: true });
        }
    }
}
