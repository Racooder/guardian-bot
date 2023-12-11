import { EventListener } from "../EventListeners";
import { Commands } from "../Interactions";
import { debug, error, info, success } from "../Log";

export const Ready: EventListener = {
    start: (client) =>{
        client.on("ready", async () => {
            debug("Ready event triggered");

            if (client.user === null || client.application === null) {
                error("Discord client not ready");
                return;
            }

            // TODO: Connect to database

            // TODO: Clear expired database entries

            info("Registering commands...");
            await client.application.commands.set(Commands);

            info("Setting activity...");
            client.user.setActivity({
                name: "Support me on Ko-fi!",
            });

            success(`${client.user.tag} is online`);

            // TODO: Update Statistics
        });
    }
}
