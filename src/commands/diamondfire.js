const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Interaction } = require('discord.js');

/**
 * Replies with information about my DiamondFire games
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
		.setName('diamondfire')
		.setDescription('Informations about my DiamondFire games!'),
    /**
     * Replies with a list of my DiamondFire games
     * @param {Interaction} interaction - The interaction object
     */
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

        await interaction.reply({embeds: [embed], ephemeral: true});
	},
};
