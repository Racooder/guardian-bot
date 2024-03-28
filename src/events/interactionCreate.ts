import { debug, error } from "../Log";
import { EventListener } from "../EventListeners";
import { ButtonInteraction, Client, CommandInteraction, ComponentType, MessageComponentInteraction } from "discord.js";
import { Commands, ComponentReturnType, Components, ReplyType, SlashCommandReturnType } from '../Interactions';
import { BotUserNotFoundFailure, CommandNotFoundFailure, ComponentNotFoundFailure, Failure, UnknownComponentTypeFailure } from "../Failure";
import { RawStatistic, insertStatistic } from "../models/statistic";
import { BotUser, getOrCreateBotUser } from "../models/botUser";
import mongoose from "mongoose";

export const InteractionCreate: EventListener = {
    start: (client) => {
        client.on("interactionCreate", async (interaction) => {
            debug("Interaction event triggered");

            let result: SlashCommandReturnType | ComponentReturnType | Failure;
            if (interaction.isCommand()) {
                result = await handleSlashCommand(client, interaction);
            } else if (interaction.isMessageComponent()) {
                result = await handleMessageComponent(client, interaction);
            } else {
                error("Unknown interaction type");
                return;
            }

            await updateStatistics(result);
            await replyToInteraction(interaction, result);
        });
    }
}

async function updateStatistics(response: SlashCommandReturnType | ComponentReturnType | Failure) {
    let statistic: RawStatistic;
    if (response instanceof Failure) {
        statistic = response.statistic();
    } else {
        statistic = response.statistic;
    }
    insertStatistic(statistic);
}

async function replyToInteraction(interaction: CommandInteraction | MessageComponentInteraction, response: SlashCommandReturnType | ComponentReturnType | Failure) {
    if (response instanceof Failure) {
        interaction.reply(response.slashCommandResponse("en", true)); // TODO: Get language from user
        return;
    }

    const reply = response.response;

    // TODO: Localization

    switch (reply.replyType) {
        case ReplyType.Reply:
            interaction.reply(reply);
            break;
        case ReplyType.FollowUp:
            interaction.reply(reply);
            break;
        case ReplyType.Update:
            interaction.editReply(reply);
            break;
    }
}

async function handleSlashCommand(client: Client, interaction: CommandInteraction): Promise<SlashCommandReturnType | Failure> {
    debug("Slash command interaction recieved");

    debug("Getting command");
    const commandHandler = Commands.find(
        (command) => command.name === interaction.commandName
    );

    if (!commandHandler) {
        error("Command not found");
        return new CommandNotFoundFailure();
    }

    let botUser: BotUser | undefined;
    if (interaction.inGuild()) {
        botUser = await getOrCreateBotUser(interaction.guildId!) || undefined;
    } else {
        botUser = await getOrCreateBotUser(interaction.user.id) || undefined;
    }
    if (botUser === undefined) {
        return new BotUserNotFoundFailure();
    }

    debug("Running command");
    const commandReturn = await commandHandler.run(client, interaction, botUser);

    if (!interaction.isChatInputCommand()) {
        return commandReturn;
    }

    const subcommand = interaction.options.getSubcommand(false);

    if (subcommand === null || commandHandler.subcommands === undefined) {
        return commandReturn;
    }

    const subcommandHandler = commandHandler.subcommands[subcommand];
    return subcommandHandler(client, interaction, botUser);
}

async function handleMessageComponent(client: Client, interaction: MessageComponentInteraction): Promise<ComponentReturnType | Failure> {
    debug("Message component interaction recieved");

    let componentData = interaction.customId.split(":");
    const componentName = componentData.shift();

    debug("Getting component");
    const componentHandler = Components.find(
        (component) => component.name === componentName
    );

    if (!componentHandler) {
        error("Component not found");
        return new ComponentNotFoundFailure();
    }

    let botUser: BotUser | undefined;
    if (interaction.inGuild()) {
        botUser = await getOrCreateBotUser(interaction.guildId!) || undefined;
    } else {
        botUser = await getOrCreateBotUser(interaction.user.id) || undefined;
    }
    if (botUser === undefined) {
        return new BotUserNotFoundFailure();
    }

    debug("Running component");
    switch (componentHandler.type) {
        case ComponentType.Button:
            return componentHandler.run(client, interaction as ButtonInteraction, botUser, componentData);
        case ComponentType.StringSelect:
            return componentHandler.run(client, interaction as MessageComponentInteraction, botUser, componentData);
        default:
            return new UnknownComponentTypeFailure();
    }
}
