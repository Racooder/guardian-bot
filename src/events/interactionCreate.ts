import { debug, error } from "../Log";
import { EventListener } from "../EventListeners";
import { ButtonInteraction, Client, CommandInteraction, MessageComponentInteraction } from "discord.js";
import { Commands, ComponentResponse, ComponentType, Components, SlashCommandResponse } from "../Interactions";
import { CommandNotFoundFailure, ComponentNotFoundFailure, UnknownComponentTypeFailure } from "../Failure";
import { RawStatistic, insertStatistic } from "../models/statistic";

export const InteractionCreate: EventListener = {
    start: (client) => {
        client.on("interactionCreate", async (interaction) => {
            debug("Interaction event triggered");

            const stats: RawStatistic[] = [];
            if (interaction.isCommand()) {
                const {response, statistic} = await handleSlashCommand(client, interaction);
                stats.push(statistic);

                if (response.initial) {
                    interaction.reply(response);
                } else {
                    interaction.followUp(response);
                }
            } else if (interaction.isMessageComponent()) {
                handleMessageComponent(client, interaction);
            }

            stats.forEach(s => {
                insertStatistic(s);
            });
        });
    }
}

async function handleSlashCommand(client: Client, interaction: CommandInteraction): Promise<{response: SlashCommandResponse, statistic: RawStatistic}> {
    debug("Slash command interaction recieved");

    debug("Getting command");
    const commandHandler = Commands.find(
        (command) => command.name === interaction.commandName
    );

    if (!commandHandler) {
        error("Command not found");
        return new CommandNotFoundFailure().slashCommandResponse("en", true); // TODO: Get language from user
    }

    // TODO: Update statistics

    debug("Running command");
    return commandHandler.run(client, interaction);
}

async function handleMessageComponent(client: Client, interaction: MessageComponentInteraction): Promise<ComponentResponse> {
    debug("Message component interaction recieved");

    let componentData = interaction.customId.split(":");
    const componentName = componentData.shift();

    debug("Getting component");
    const componentHandler = Components.find(
        (component) => component.name === componentName
    );

    if (!componentHandler) {
        error("Component not found");
        return new ComponentNotFoundFailure().componentResponse("en"); // TODO: Get language from user
    }

    // TODO: Update statistics

    debug("Running component");
    switch (componentHandler.type) {
        case ComponentType.Button:
            return componentHandler.run(client, interaction as ButtonInteraction, componentData);
        case ComponentType.StringSelectMenu:
            return componentHandler.run(client, interaction as MessageComponentInteraction, componentData);
        default:
            return new UnknownComponentTypeFailure().componentResponse("en"); // TODO: Get language from user
    }
}
