// * Imports
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const mongoose = require('mongoose')
require('dotenv').config();

/**
 * The discord client
 */
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// * Event Setup
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

// * Database Setup
mongoose.connect(process.env.MONGODB_SRV, {
	useNewUrlParser: true,
	useUnifiedTopology: true
}).then(()=>{
	console.log('Connected to the database!');
}).catch((err)=>{
	console.log(err);
})

// * Command Setup
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// * Client Login
client.login(process.env.TOKEN);
