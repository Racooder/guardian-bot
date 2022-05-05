const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Interaction, MessageActionRow, MessageButton } = require('discord.js');
const { readFileChangelog } = require('../fileReader');

/**
 * Replies with the changelog
 */
module.exports = {
    /**
     * If the command is only available for guilds
     */
	guildOnly: false,
    /**
     * The SlashCommandBuilder
     */
	data: new SlashCommandBuilder()
		.setName('changelog')
		.setDescription('Review the changelog!'),
    /**
     * Replies with a list of my DiamondFire games
     * @param {Interaction} interaction - The interaction object
     */
	async execute(interaction) {
        const changelog = await readFileChangelog();
		const embed = new MessageEmbed()
            .setTitle(changelog[0][0])
            .setDescription(changelog[0][1]);

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(`changelog_page_2`)
                    .setLabel("Next Page")
                    .setStyle('PRIMARY')
            );

        await interaction.reply({embeds: [embed], components: [row], ephemeral: true});
	},
};
