import { CommandInteraction, Client, Interaction, ButtonInteraction, MessageComponentInteraction, StringSelectMenuInteraction } from "discord.js";
import { Commands, Components } from "../Interactions";
import { generalError } from "../InteractionReplies";
import { Button, StringSelectMenu } from '../InteractionInterface';

/**
 * A listener and handler for the interactionCreate event.
 */
export default (client: Client): void => {
    client.on("interactionCreate", async (interaction: Interaction) => {
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
    // Get the command
    const slashCommand = Commands.find(c => c.name === interaction.commandName);
    if (!slashCommand) {
        interaction.followUp(generalError);
        return;
    }

    // Run the command
    slashCommand.run(client, interaction);
}

/**
 * Handles a message component interaction.
 * @param client - The client
 * @param interaction - The interaction
 */
const handleComponent = async (client: Client, interaction: MessageComponentInteraction): Promise<void> => {
    // Get the interaction data from the custom ID
    let data = interaction.customId.split(":");
    const name = data.shift();

    // Get the component
    const component = Components.find(b => b.name === name);
    if (!component) {
        interaction.reply(generalError);
        return;
    }

    // Determine the type of component and run it
    if (component.isButton) {
        const button = component as Button;
        button.run(client, interaction as ButtonInteraction, data);
    } else if (component.isStringSelectMenu) {
        const stringSelectMenu = component as StringSelectMenu;
        stringSelectMenu.run(client, interaction as StringSelectMenuInteraction, data);
    }
}
