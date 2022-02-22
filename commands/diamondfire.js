const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	guildOnly: false,
	data: new SlashCommandBuilder()
		.setName('diamondfire')
		.setDescription('Informations about my DiamondFire games!'),
	async execute(interaction) {
		const embed = new MessageEmbed()
            .setTitle("My DiamondFire Games")
            .setDescription("Commands for joining my games/plots on the `mcdiamondfire.com` minecraft server.")
            .addFields(
				{
                    name: "Engineer's Recursion",
                    value: "`/join 42546`"
                }
            );

        await interaction.reply({embeds: [embed]});
	},
};