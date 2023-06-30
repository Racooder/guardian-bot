import { CommandInteraction, Client, Interaction, ButtonInteraction, MessageComponentInteraction, StringSelectMenuInteraction } from "discord.js";
import { Commands, Components } from "../Interactions";
import { generalError } from "../InteractionReplies";
import { Button, StringSelectMenu } from '../InteractionInterfaces';
import { debug, error } from "../Log";
import { StatisticType, updateStatistic } from "../models/statisticsSchema";

/**
 * A listener and handler for the interactionCreate event.
 */
export default (client: Client): void => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        debug("Interaction received");

        if (interaction.isCommand()) {
            await handleSlashCommand(client, interaction as CommandInteraction);
        } else if (interaction.isMessageComponent()) {
            await handleComponent(client, interaction as MessageComponentInteraction);
        }
    });
}

/**
 * Handles a slash command interaction.
 * @param client - The client
 * @param interaction - The interaction
 */
const handleSlashCommand = async (client: Client, interaction: CommandInteraction): Promise<void> => {
    debug("Slash command interaction received");

    // Get the command
    const slashCommand = Commands.find(c => c.name === interaction.commandName);
    if (!slashCommand) {
        interaction.followUp(generalError);
        return;
    }

    // Run the command
    try {
        slashCommand.run(client, interaction);
    } catch (e: unknown) {
        error((e as string), client);
    }

    updateStatistic([StatisticType.Event, StatisticType.Event_Interaction, StatisticType.Command]);
}

/**
 * Handles a message component interaction.
 * @param client - The client
 * @param interaction - The interaction
 */
const handleComponent = async (client: Client, interaction: MessageComponentInteraction): Promise<void> => {
    debug("Message component interaction received");

    // Get the interaction data from the custom ID
    let data = interaction.customId.split(":");
    const name = data.shift();

    // Get the component
    const component = Components.find(b => b.name === name);
    if (!component) {
        error(`Component ${name} not found`, client);
        interaction.reply(generalError);
        return;
    }

    // Determine the type of component and run it
    try {
        if (component.isButton) {
            const button = component as Button;
            button.run(client, interaction as ButtonInteraction, data);
        } else if (component.isStringSelectMenu) {
            const stringSelectMenu = component as StringSelectMenu;
            stringSelectMenu.run(client, interaction as StringSelectMenuInteraction, data);
        }
    } catch (e: unknown) {
        error((e as string), client);
    }

    updateStatistic([StatisticType.Event, StatisticType.Event_Interaction, StatisticType.Component]);
}
