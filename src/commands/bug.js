const { SlashCommandBuilder } = require('@discordjs/builders');
const { Interaction } = require('discord.js');
const { report, reportFlags } = require('../report');
require('dotenv').config();

/**
 * - bug `<description>` - Sends a bug report to the developers
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
		.setName('bug')
		.setDescription('Report a bug!')
        .addStringOption(option => option.setName('description').setDescription('A description of the bug.').setRequired(true)),
    /**
     * Sends a message to the bug report channel
     * @param {Interaction} interaction - The interaction object
     */
	async execute(interaction) {
        const client = interaction.client;
        const username = interaction.user.username;
        const avatar = interaction.user.displayAvatarURL();
        const description = interaction.options.getString('description');
        const flags = reportFlags.bug;
        report(client, username, avatar, description, flags);
        await interaction.reply({content: "Successfully send the bug report!", ephemeral: true});
	},
};
