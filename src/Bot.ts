import { Client, IntentsBitField } from "discord.js";
import { debug, info } from "./Log";
import { Listeners } from "./EventListeners";

export async function setupDiscordBot(): Promise<Client> {
    info("Starting Discord bot...");

    const discordClient = new Client({
        intents: [IntentsBitField.Flags.Guilds],
    });

    debug("Starting event listeners...");
    for (const listener of Listeners) {
        listener.start(discordClient);
    }

    debug("Logging in...");
    await discordClient.login(process.env.DISCORD_TOKEN);

    return discordClient;
}
