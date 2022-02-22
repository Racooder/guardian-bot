// * Imports
const { Client, Intents } = require('discord.js');
const { updateGuild, updateGlobal } = require('../deploy-commands');
require('dotenv').config();

/**
 * The discord client
 */
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// * Ready Event Setup
client.once('ready', () => {
    const guilds = client.guilds.cache.map(guild => guild.id);
    updateGuild(guilds);
    updateGlobal();
});

// * Client Login
client.login(process.env.TOKEN);