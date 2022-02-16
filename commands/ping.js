const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	guildOnly: false,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction, client) {
		await interaction.deferReply()
        const pong = await interaction.fetchReply();
		const latency = pong.createdTimestamp - interaction.createdTimestamp;

        const pongMessage = new MessageEmbed()
            .addFields(
				{
                    name: ':stopwatch: Latency',
                    value: `${latency}ms`
                },
                {
                    name: ':hourglass: API Latency',
                    value: `${Math.round(client.ws.ping)}ms`
                }
            );

        await interaction.editReply({embeds: [pongMessage]});
	},
};