const translate = require('../translate');
const { existsSync } = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

/**
 * Creates the message of a game menu
 * @param {String} menuId - The id of the menu to open
 * @param {String} user - The user id
 * @param {String} language - The language of the menu
 * @returns {Object} The message object
 */
module.exports = (menuId, user, language) => {
    if (!existsSync(`./src/game/menus/${menuId}.json`)) {
        console.warn("User opened a menu that doesn't exist!");
        const message = { content: "The selected menu doesn't exist (However you got here) please report this to a developer!", embeds: [], components: [] };
        return message;
    }

    /**
     * The menu data
     * 
     * JSON format:
     *  {
     *      "color": "#FFFFFF",
     *      "title": "The title of the menu",
     *      "description": "The description of the menu",
     *      "fields": [
     *          {
     *              "name": "The name of the field",
     *              "value": "The value of the field",
     *              "inline": true
     *          }
     *      ],
     *     "buttons": [
     *          {
     *              "id": "The id of the button",
     *              "lable": "The label of the button",
     *              "style": "The style of the button"
     *          }
     *      ]
     * }
     */
    const menuDict = require(`../game/menus/${menuId}.json`);
    
    const embed = new MessageEmbed()
    .setColor(menuDict.color)
    .setTitle(translate(menuDict.title, `game/${language}`))
    .setDescription(translate(menuDict.description, `game/${language}`))
	
    for (const field of menuDict.fields) {
        embed.addField(
            translate(field.name, `game/${language}`),
            translate(field.value, `game/${language}`),
            field.inline
        );
    }

    const row = new MessageActionRow();

    for (const button of menuDict.buttons) {
        row.addComponents(
            new MessageButton()
                .setCustomId(`game_${user}_${button.id}`)
                .setLabel(translate(button.label, `game/${language}`))
                .setStyle(button.style)
        );
    }

    return { embeds: [embed], components: [row] };
}
