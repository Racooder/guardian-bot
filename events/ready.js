// * Imports
const { updateGuild, updateGlobal } = require("../deploy-commands");

/**
 * The ready event
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
	 * @param {Object} client - The discord client
	 */
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		const guilds = client.guilds.cache.map(guild => guild.id);
		updateGuild(guilds);
		updateGlobal();
	},
};