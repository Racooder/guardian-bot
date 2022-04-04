// * Imports
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Client } = require('discord.js');
require('dotenv').config();

module.exports = {
    /**
     * If the command is only available for guilds
     */
	guildOnly: false,
    /**
     * The SlashCommandBuilder
     */
	data: new SlashCommandBuilder()
		.setName('bug')
		.setDescription('Report a bug!')
        .addStringOption(option => option.setName('description').setDescription('A description of the bug.').setRequired(true)),
    /**
     * Sends a message to the bug report channel
     * @param {Object} interaction - The interaction object
     */
	async execute(interaction, client) {
		const embed = new MessageEmbed()
            .setTitle("Bug Report")
            .setColor("#942725")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.displayAvatarURL()})
            .setDescription(interaction.options.getString('description'));

        client.channels.cache.get(process.env.REPORT_CHANNEL_ID).send({embeds: [embed]});
        await interaction.reply({content: "Successfully send the bug report!", ephemeral: true});
	},
};