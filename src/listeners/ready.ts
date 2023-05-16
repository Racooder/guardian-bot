import { Client } from "discord.js";
import { Commands } from "../Interactions";
import mongoose, { ConnectOptions } from "mongoose";
import quoteListSchema from "../models/quoteListSchema";
import quoteGuesserSchema from "../models/quoteGuesserSchema";

/**
 * A listener for the ready event.
 */
export default (client: Client): void => {
    client.on("ready", async () => {
        // Make sure the client is ready
        if (!client.user || !client.application) {
            return;
        }

        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI || '', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        } as ConnectOptions);

        console.log("Clearing old database elements...");
        quoteListSchema.clearOld();
        quoteGuesserSchema.clearOld();

        console.log("Registering commands...");
        await client.application.commands.set(Commands);

        console.log(`${client.user.username} is online`);
    });
}
