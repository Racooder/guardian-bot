const { updateGuild, updateGlobal } = require("../deploy-commands");
const { Client } = require("discord.js");
const { readFileSync } = require('fs');
const log = require('../log.js');

/**
 * The event when the bot has completed his login.
 */
module.exports = {
	/**
     * The name of the event
     */
	name: 'ready',
	/**
     * If the event is executed once
     */
	once: true,
	/**
	 * Handles the ready event
	 * @param {Client} client - The discord client
	 */
	execute(client) {
		log.success(`Ready! Logged in as ${client.user.tag}`);
		const guilds = client.guilds.cache.map(guild => guild.id);
		updateGuild(guilds);
		updateGlobal();

		getFirstLine('./changelog').then((updateName) => {
			console.log(`Update: ${updateName}`);
			client.user.setActivity(`${updateName} - Use /changelog for more info.`, { type: "PLAYING" })
		});
	},
};

async function getFirstLine(filePath) {
    try {
		const fileContent = readFileSync(filePath, 'utf8');
		return (fileContent.match(/(^.*)/) || [])[1] || '';
	} catch (err) {
		log.error(err);
	}
}
