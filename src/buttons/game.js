const { readdirSync } = require('fs');
const { Interaction } = require('discord.js');
const gameModel = require('../models/game');
const openMenu = require('../game/menu');
const { report, reportFlags } = require('../report');

module.exports = {
    /**
     * The button id prefix
     */
    id: 'game',
    /**
     * Handles a game menu button
     * @param {Interaction} interaction - The interaction object
     * @param {String[]} args - The button arguments
     */
	async execute(interaction, args) {
        /**
         * The user id
         */
        const user = args.shift();
        /**
         * The instruction string
         */
        const instruction = args.shift();

        if (user != interaction.user.id){
            const client = interaction.client;
            const username = interaction.user.username;
            const avatar = interaction.user.displayAvatarURL();
            const description = `${username} tried to use a game button with the id ${interaction.customId} but an error occured!`;
            const flags = reportFlags.error;
            report(client, username, avatar, description, flags);
            await interaction.reply({ content: "This menu isn't yours (However you managed to do this) please report this to a developer!", ephemeral: true }); 
            return   
        }

        let gameData = await gameModel.findOne({ userID: user });

        let message;

        switch (instruction) {
            case 'menu': {
                message = openMenu(args[0], user, gameData.language);
                break;
            }
            case 'setting': {
                message = await changeSetting(args[0], user, gameData.language);
                break;
            }
        }

		interaction.update({ content: message.content, embeds: message.embeds, components: message.components, ephemeral: true });
	},
};

/**
 * Changes the given game setting
 * @param {String} setting - The setting to change
 * @param {String} user - The user id
 * @param {String} language - The language key
 * @returns {Object} - The message object
 */
async function changeSetting(setting, user, language) {
    switch (setting) {
        case 'deletePlayer': {
            await gameModel.deleteOne({ userID: user });
            const message = { content: "Your player account was successfully deleted! (Use `/game` to create a new one)", embeds: [], components: [] };
            return message;
        }
        case 'language': {
            const languages = readdirSync('./src/dictionaries/game').filter(file => file.endsWith('.json'));
            let newLanguage;

            for (let i = 0; i < languages.length; i++) {
                const lang = languages[i].slice(0, -5);
                if (lang == language) {
                    newLanguage = languages[(i + 1) % languages.length].slice(0, -5);
                    break;
                }
            }

            if (newLanguage != undefined) {
                await gameModel.findOneAndUpdate({
                    userID: user
                },
                {
                    $set: {
                        language: newLanguage
                    }
                })

                const message = openMenu('settings', user, newLanguage);
                return message;
            }
            else {
                const message = { content: "The selected language doesn't exist (That should actually be impossible) please report this to a developer!", embeds: [], components: [] };
                return message
            }
        }
        default: {
            const message = { content: "The selected setting doesn't exist (That should actually be impossible) please report this to a developer!", embeds: [], components: [] };
            return message;
        }
    }
}
