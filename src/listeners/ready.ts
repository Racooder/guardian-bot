import { Client } from "discord.js";
import { Commands } from "../Interactions";
import mongoose, { ConnectOptions } from "mongoose";

export default (client: Client): void => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }

        await mongoose.connect(process.env.MONGO_URI || '', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        } as ConnectOptions);

        await client.application.commands.set(Commands);

        console.log(`${client.user.username} is online`);
    });
};
