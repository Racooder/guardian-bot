const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	guildOnly: false,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};