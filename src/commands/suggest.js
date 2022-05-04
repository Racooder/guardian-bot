const { SlashCommandBuilder } = require('@discordjs/builders');
const { Interaction } = require('discord.js');
const { report, reportFlags } = require('../report');

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
		.setName('suggest')
		.setDescription('Suggest a feature or improvement for the bot!')
        .addStringOption(option => option.setName('description').setDescription('A description of your idea.').setRequired(true)),
    /**
     * Sends a message to the bug report channel
     * @param {Interaction} interaction - The interaction object
     */
	async execute(interaction) {
        const client = interaction.client;
        const username = interaction.user.username;
        const avatar = interaction.user.displayAvatarURL();
        const description = interaction.options.getString('description');
        const flag = reportFlags.suggestion;
        report(client, username, avatar, description, flag);
        await interaction.reply({content: "Successfully send the suggestion!", ephemeral: true});
	},
};
