const { Client, Intents } = require('discord.js');
const { removeGlobal, removeGuild } = require("./deploy-commands");
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.login(process.env.TOKEN);

const guilds = client.guilds.cache.map(guild => guild.id);
removeGuild(guilds);
removeGlobal();
console.log("Removed all registered commands!");