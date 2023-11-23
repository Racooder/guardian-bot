import { Client } from "discord.js";
import { Commands } from "../Interactions";
import mongoose, { ConnectOptions } from "mongoose";
import quoteListSchema from "../models/quoteListSchema";
import quoteGuesserSchema from "../models/quoteGuesserSchema";
import { info, success, debug } from "../Log";
import { StatisticType, updateStatistic } from "../models/statisticsSchema";

/**
 * A listener for the ready event.
 */
export default (client: Client): void => {
    client.on("ready", async () => {
        debug("Client ready");

        // Make sure the client is ready
        if (!client.user || !client.application) {
            return;
        }

        info("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI || "", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as ConnectOptions);

        info("Clearing old database elements...");
        quoteListSchema.clearOld();
        quoteGuesserSchema.clearOld();

        info("Registering commands...");
        await client.application.commands.set(Commands);

        info("Setting activity...");
        client.user.setActivity({
            name: "Support me on Ko-fi!",
        });

        success(`${client.user.username} is online`);

        updateStatistic([StatisticType.Event, StatisticType.Event_Ready]);
    });
};
