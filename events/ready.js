const deployCommands = require("../deploy-commands");

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		const guilds = client.guilds.cache.map(guild => guild.id);
		// deployCommands.removeGuild(guilds);
		deployCommands.deployGuild(guilds);
		// deployCommands.removeGlobal();
		deployCommands.deployGlobal();
	},
};