import { Client, EmbedBuilder, GuildMember, StringSelectMenuInteraction } from 'discord.js';
import { StringSelectMenu } from '../InteractionInterface';
import { isGuildCommand } from '../Essentials';
import { noGuildError } from '../InteractionReplies';
import quoteGuesserSchema from '../models/quoteGuesserSchema';

export const AnswerQuoteGuesser: StringSelectMenu = {
    name: "answerQuoteGuesser",
    isStringSelectMenu: true,
    run: async (client: Client, interaction: StringSelectMenuInteraction, data: string[]) => {
        if (!isGuildCommand(interaction)) {
            await interaction.reply(noGuildError);
            return;
        }

        const token = data[0];
        const user = interaction.values[0] ?? null;

        if (user === null) {
            return;
        }
        const result = await quoteGuesserSchema.addAnswer(interaction.guildId!, token, interaction.member as GuildMember, user);

        if (result === 1 || result === 2) {
            const embedBuilder = EmbedBuilder.from(interaction.message.embeds[0]);
            const answerCount = await quoteGuesserSchema.getAnswerCount(interaction.guildId!, token);
            embedBuilder.setFooter({
                text: `Answered by ${answerCount} player${answerCount === 1 ? "" : "s"}`,
            });

            await interaction.update({
                embeds: [embedBuilder],
            });
        
            interaction.followUp({ content: resultTranslation[result], ephemeral: true });
        } else {
            interaction.reply({ content: resultTranslation[result], ephemeral: true });
        }
    }
}

type ResultTranslation = {
    [key: number]: string;
}

const resultTranslation: ResultTranslation = {
    1: "Your answer was correct!",
    2: "Your answer was wrong!",
    3: "No game found with that token",
    4: "You have already answered correctly!\nYou can't change your answer",
    5: "You have already answered incorrectly!\nYou can't change your answer"
}
