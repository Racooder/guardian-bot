// * Imports
const { Client, Intents } = require('discord.js');
const { removeGlobal, removeGuild } = require("../deploy-commands");
require('dotenv').config();

/**
 * The discord client
 */
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// * Ready Event Setup
client.once('ready', () => {
	const guilds = client.guilds.cache.map(guild => guild.id);
    removeGuild(guilds);
    removeGlobal();
    console.log("Removed all registered commands!");
});

// * Client Login
client.login(process.env.TOKEN);
