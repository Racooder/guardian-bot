const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const mongoose = require('mongoose')
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

mongoose.connect(process.env.MONGODB_SRV, {
	useNewUrlParser: true,
	useUnifiedTopology: true
}).then(()=>{
	console.log('Connected to the database!');
}).catch((err)=>{
	console.log(err);
})

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.login(process.env.TOKEN);