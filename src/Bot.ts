import { Client } from "discord.js";
import interactionCreate from "./listeners/interactionCreate";
import ready from "./listeners/ready";
import 'dotenv/config'
import { debug, info, setupLog } from './Log';

setupLog().then(() => {
    if (process.env.DEBUG === "true") {
        info("Debug mode is enabled");
        debug("In debug mode debug messages will be saved to the log file\n")
    }

    info("Bot is starting...");
    
    const client = new Client({
        intents: []
    });
    
    // Event Handlers
    ready(client);
    interactionCreate(client);
    
    // Login
    client.login(process.env.TOKEN);
});
