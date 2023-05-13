import { CommandInteraction, Client, Interaction, ButtonInteraction } from "discord.js";
import { Commands, Buttons } from "../Interactions";

export default (client: Client): void => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await handleSlashCommand(client, interaction as CommandInteraction);
        } else if (interaction.isButton()) {
            await handleButton(client, interaction as ButtonInteraction);
        } else if (interaction.isContextMenuCommand()) {
            // handle context menu command
        }
    });
};

const handleSlashCommand = async (client: Client, interaction: CommandInteraction): Promise<void> => {
    const slashCommand = Commands.find(c => c.name === interaction.commandName);
    if (!slashCommand) {
        interaction.followUp({ content: "An error has occurred" });
        return;
    }

    slashCommand.run(client, interaction);
};

const handleButton = async (client: Client, interaction: ButtonInteraction): Promise<void> => {
    const button = Buttons.find(b => b.name === interaction.customId);
}
