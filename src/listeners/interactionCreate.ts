import { CommandInteraction, Client, Interaction, ButtonInteraction, MessageComponentInteraction, StringSelectMenuInteraction } from "discord.js";
import { Commands, Components } from "../Interactions";
import { generalError } from "../InteractionReplies";
import { Button, StringSelectMenu } from '../InteractionInterface';

export default (client: Client): void => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await handleSlashCommand(client, interaction as CommandInteraction);
        } else if (interaction.isMessageComponent()) {
            await handleComponent(client, interaction as MessageComponentInteraction);
        }
    });
}

const handleSlashCommand = async (client: Client, interaction: CommandInteraction): Promise<void> => {
    const slashCommand = Commands.find(c => c.name === interaction.commandName);
    if (!slashCommand) {
        interaction.followUp(generalError);
        return;
    }

    slashCommand.run(client, interaction);
}

const handleComponent = async (client: Client, interaction: MessageComponentInteraction): Promise<void> => {
    let data = interaction.customId.split(":");
    const name = data.shift();

    const component = Components.find(b => b.name === name);
    if (!component) {
        interaction.reply(generalError);
        return;
    }

    if (component.isButton) {
        const button = component as Button;
        button.run(client, interaction as ButtonInteraction, data);
    } else if (component.isStringSelectMenu) {
        const stringSelectMenu = component as StringSelectMenu;
        stringSelectMenu.run(client, interaction as StringSelectMenuInteraction, data);
    }
}
