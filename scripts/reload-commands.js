// * Imports
const { Client, Intents } = require('discord.js');
const { removeGuild, removeGlobal, deployGuild, deployGlobal } = require('../deploy-commands');
const log = require('../src/log.js');
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
    log.log("Removed all registered commands!");
    deployGuild(guilds);
    deployGlobal();
});

// * Client Login
client.login(process.env.TOKEN);
