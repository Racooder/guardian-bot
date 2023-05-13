import { Client } from "discord.js";
import { Commands } from "../Interactions";
import mongoose, { ConnectOptions } from "mongoose";
import quoteListSchema from "../models/quoteListSchema";

export default (client: Client): void => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }

        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI || '', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        } as ConnectOptions);

        console.log("Clearing old quote lists...");
        quoteListSchema.clearOld();

        console.log("Registering commands...");
        await client.application.commands.set(Commands);

        console.log(`${client.user.username} is online`);
    });
}
