// * Imports
const { updateGuild } = require("../deploy-commands");

/**
 * The ready event
 */
module.exports = {
	/**
     * The name of the event
     */
	name: 'guildCreate',
	/**
     * If the event is executed once
     */
	once: false,
	/**
	 * Handles the guildCreate event
	 * @param {Object} guild - The joined guild
	 */
	execute(guild) {
		updateGuild([guild.id]);
	},
};