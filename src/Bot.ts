import { Client } from "discord.js";
import interactionCreate from "./listeners/interactionCreate";
import ready from "./listeners/ready";
import 'dotenv/config'

console.log("Bot is starting...");

const client = new Client({
    intents: []
});

// Event Handlers
ready(client);
interactionCreate(client);

// Login
client.login(process.env.TOKEN);
