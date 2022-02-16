const { Client, Intents } = require('discord.js');
const { updateGuild, updateGlobal } = require('../deploy-commands');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
    const guilds = client.guilds.cache.map(guild => guild.id);
    updateGuild(guilds);
    updateGlobal();
});

client.login(process.env.TOKEN);