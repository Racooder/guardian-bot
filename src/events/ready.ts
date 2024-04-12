import { insertStatistic } from "../models/statistic";
import { EventListener } from "../EventListeners";
import { Commands } from "../Interactions";
import { debug, error, info, success } from "../Log";
import mongoose from "mongoose";
import statisticKeys from "../../data/statistic-keys.json"
import config from "../../config.json";

export const Ready: EventListener = {
    start: (client) =>{
        client.on("ready", async () => {
            debug("Ready event triggered");

            if (client.user === null || client.application === null) {
                error("Ready event triggered but client or application is not available");
                return;
            }

            info("Setting up database...");
            await mongoose.connect(process.env.MONGO_URI || "", {
                dbName: config.database_name
            });
            success("Database connected");

            // TODO: Clear expired database entries

            info("Registering commands...");
            await client.application.commands.set(Commands);
            debug("Registered commands: (" + Commands.map((command) => command.name).join(", ") + ")");

            info("Setting activity...");
            client.user.setActivity({
                name: "/donate",
            });

            success(`${client.user.tag} is online`);

            insertStatistic({
                global: true,
                key: statisticKeys.bot.event.ready,
            });
        });
    }
}
