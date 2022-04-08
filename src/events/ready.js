const { updateGuild, updateGlobal } = require("../deploy-commands");
const { Client } = require("discord.js");

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
		console.log(`Ready! Logged in as ${client.user.tag}`);
		const guilds = client.guilds.cache.map(guild => guild.id);
		updateGuild(guilds);
		updateGlobal();
	},
};
