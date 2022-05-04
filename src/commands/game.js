const { SlashCommandBuilder } = require('@discordjs/builders');
const { Interaction } = require('discord.js');
const gameModel = require('../models/game');
const openMenu = require('../game/menu');

/**
 * Opens the player's game menu
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
		.setName('game')
		.setDescription('The Game!'),
    /**
     * Opens the player's game menu
     * @param {Interaction} interaction - The interaction object
     */
	async execute(interaction) {
        let gameData;
        gameData = await gameModel.findOne({ userID: interaction.user.id });
        if (!gameData) {
            let game = await gameModel.create({
                userID: interaction.user.id,
                language: 'en',
            });
            await game.save();
            gameData = await gameModel.findOne({ userID: interaction.user.id });
        }

        const message = openMenu('main', interaction.user.id, gameData.language);
        interaction.reply({ embeds: message.embeds, components: message.components, ephemeral: true });
	},
};
