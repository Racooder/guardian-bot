import { Client, EmbedBuilder, GuildMember, StringSelectMenuInteraction } from 'discord.js';
import { StringSelectMenu } from '../InteractionInterfaces';
import { isGuildCommand } from '../Essentials';
import { noGuildError } from '../InteractionReplies';
import quoteGuesserSchema, { resultTranslation } from '../models/quoteGuesserSchema';
import { debug } from '../Log';
import statisticsSchema, { StatisticType } from '../models/statisticsSchema';

export const AnswerQuoteGuesser: StringSelectMenu = {
    name: "answerQuoteGuesser",
    isStringSelectMenu: true,
    run: async (client: Client, interaction: StringSelectMenuInteraction, data: string[]) => {
        debug("Answer quote guesser select menu called");

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

        debug("Adding answer to database");
        const result = await quoteGuesserSchema.addAnswer(interaction.guildId!, token, interaction.member as GuildMember, user);

        // Check if adding the answer was successful
        if (result === 1 || result === 2) {
            debug("Updating embed");
            const embedBuilder = EmbedBuilder.from(interaction.message.embeds[0]);
            const answerCount = await quoteGuesserSchema.getAnswerCount(interaction.guildId!, token);
            embedBuilder.setFooter({
                text: `Answered by ${answerCount} player${answerCount === 1 ? "" : "s"}`,
            });

            debug("Updating message");
            await interaction.update({
                embeds: [embedBuilder],
            });
        
            debug("Replying to user");
            interaction.followUp({ content: resultTranslation[result], ephemeral: true });

            debug("Updating statistics");
            statisticsSchema.create({
                types: [StatisticType.Component, StatisticType.Component_QuoteGuesser, StatisticType.Component_QuoteGuesser_Answer],
            });
        } else {
            debug("Replying problem to user");
            interaction.reply({ content: resultTranslation[result], ephemeral: true });
        }
    }
}
