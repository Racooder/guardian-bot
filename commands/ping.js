const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    /**
     * If the command is only available for guilds
     */
	guildOnly: false,
    /**
     * The SlashCommandBuilder
     */
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
    /**
     * Replies with informations about the user and bot latency
     * @param {Object} interaction - The interaction object
     * @param {Object} client - The discord client
     */
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
