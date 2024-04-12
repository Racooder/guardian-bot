import { debug, error, logToDiscord } from "../Log";
import { EventListener } from "../EventListeners";
import { ButtonInteraction, Client, CommandInteraction, ComponentType, InteractionUpdateOptions, MessageComponentInteraction } from "discord.js";
import { Commands, ComponentReturnType, Components, ReplyType, SlashCommandReturnType } from '../Interactions';
import { CommandNotFoundFailure, ComponentNotFoundFailure, Failure, MessageComponentExecutionFailure, SlashCommandExecutionFailure, UnknownComponentTypeFailure } from '../Failure';
import { RawStatistic, insertStatistic } from "../models/statistic";
import { BotUser, BotUserType, updateBotUser } from "../models/botUser";

export const InteractionCreate: EventListener = {
    start: (client) => {
        client.on("interactionCreate", async (interaction) => {
            debug("Interaction event triggered");

            let botUser: BotUser;
            if (interaction.inGuild()) {
                botUser = await updateBotUser(interaction.guildId!, BotUserType.GUILD, interaction.guild!.name, interaction.guild!.memberCount);
            } else {
                botUser = await updateBotUser(interaction.user.id, BotUserType.USER, interaction.user.username, 0);
            }

            let result: SlashCommandReturnType | ComponentReturnType | Failure;
            if (interaction.isCommand()) {
                result = await handleSlashCommand(client, interaction, botUser);
            } else if (interaction.isMessageComponent()) {
                result = await handleMessageComponent(client, interaction, botUser);
            } else {
                logToDiscord(client, error("Unknown interaction type"));
                return;
            }

            await updateStatistics(result);
            await replyToInteraction(interaction, result);
            if (result instanceof Failure) {
                result.log(client);
            }
        });
    }
}

async function updateStatistics(response: SlashCommandReturnType | ComponentReturnType | Failure) {
    debug("Updating statistics");

    let statistic: RawStatistic;
    if (response instanceof Failure) {
        statistic = response.statistic();
    } else {
        statistic = response.statistic;
    }
    insertStatistic(statistic);
}

async function replyToInteraction(interaction: CommandInteraction | MessageComponentInteraction, response: SlashCommandReturnType | ComponentReturnType | Failure) {
    debug("Replying to interaction");

    if (response instanceof Failure) {
        interaction.reply(response.slashCommandResponse("en", true)); // TODO: Get language from user
        return;
    }

    const reply = response.response;

    // TODO: Localization (For ephemeral messages, we should always use the user's language)

    switch (reply.replyType) {
        case ReplyType.Reply:
            interaction.reply(reply);
            break;
        case ReplyType.FollowUp:
            interaction.reply(reply);
            break;
        case ReplyType.Update:
            if (interaction.isMessageComponent() ) {
                interaction.update(reply as InteractionUpdateOptions);
            } else {
                interaction.editReply(reply);
            }
            break;
    }
}

async function handleSlashCommand(client: Client, interaction: CommandInteraction, botUser: BotUser): Promise<SlashCommandReturnType | Failure> {
    debug("Slash command interaction recieved");

    debug(`Getting command ${interaction.commandName}`);
    const commandHandler = Commands.find(
        (command) => command.name === interaction.commandName
    );

    if (!commandHandler) {
        logToDiscord(client, error(`Command ${interaction.commandName} not found`));
        return new CommandNotFoundFailure();
    }

    debug("Running command");
    let commandReturn: SlashCommandReturnType | Failure;
    try {
        commandReturn = await commandHandler.run(client, interaction, botUser);
    } catch (err) {
        return new SlashCommandExecutionFailure(err);
    }

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

async function handleMessageComponent(client: Client, interaction: MessageComponentInteraction, botUser: BotUser): Promise<ComponentReturnType | Failure> {
    debug("Message component interaction recieved");

    let componentData = interaction.customId.split(":");
    const componentName = componentData.shift();

    debug(`Getting component ${componentName}`);
    const componentHandler = Components.find(
        (component) => component.name === componentName
    );

    if (!componentHandler) {
        return new ComponentNotFoundFailure();
    }

    debug("Running component");
    try {
        switch (componentHandler.type) {
            case ComponentType.Button:
                return componentHandler.run(client, interaction as ButtonInteraction, botUser, componentData);
            case ComponentType.StringSelect:
                return componentHandler.run(client, interaction as MessageComponentInteraction, botUser, componentData);
            default:
                return new UnknownComponentTypeFailure();
        }
    } catch (err) {
        return new MessageComponentExecutionFailure(err);
    }
}
