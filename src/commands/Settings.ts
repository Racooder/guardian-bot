import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField, InteractionReplyOptions } from 'discord.js';
import { Command } from "../InteractionInterfaces";
import { ChangeSettingResult, changeSetting, handleSubcommands, isGuildCommand } from "../Essentials";
import { generalError, noGuildError } from "../InteractionReplies";
import guildSchema, { GuildSettings } from '../models/guildSchema';
import Colors from '../Colors';
import { debug, error } from '../Log';
import { StatisticType } from '../models/statisticsSchema';

export const Settings: Command = {
    name: "settings",
    description: "View or the settings for this server",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "view",
            description: "View the settings for this server"
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "edit",
            description: "Edit a setting for this server",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "setting",
                    description: "The setting to change",
                    choices: [
                        {
                            name: "Quote List Page Size (number)",
                            value: "quoteListPageSize"
                        },
                        {
                            name: "Quote Search Date Tolerance (number)",
                            value: "quoteSearchDateTolerance"
                        }
                    ],
                    required: true
                },
                {
                    type: ApplicationCommandOptionType.Number,
                    name: "number-value",
                    description: "The new value for the setting"
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "quote-link",
            description: "Link this guild to another guild to share quotes",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "guild-id",
                    description: "The ID of the guild to link to",
                    required: true
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "quote-unlink",
            description: "Unlink this server from another server",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "guild-id",
                    description: "The ID of the guild to unlink from",
                    required: true
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "quote-link-list",
            description: "List all linked guilds"
        }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        debug("Settings command called");

        if (!interaction.isChatInputCommand()) {
            error("Settings command was not a chat input command", client);
            await interaction.reply(generalError);
            return;
        }
        if (!isGuildCommand(interaction)) {
            debug("Settings command was not a guild command"); // This happens when the command is run in a DM
            await interaction.reply(noGuildError);
            return;
        }

        debug("Checking if user has permission to use this command");
        const permissions = interaction.member!.permissions as PermissionsBitField;
        if (!permissions.has(PermissionsBitField.Flags.ManageGuild | PermissionsBitField.Flags.Administrator)) {
            debug("User does not have permission to use this command");
            await interaction.reply({
                content: "You do not have permission to use this command",
                ephemeral: true
            });
            return;
        }

        await handleSubcommands(interaction, interaction.options.getSubcommand(), [
            {
                key: "view",
                run: handleView,
                stats: [StatisticType.Command_Settings_View]
            },
            {
                key: "edit",
                run: handleEdit,
                stats: [StatisticType.Command_Settings_Edit]
            },
            {
                key: "quote-link",
                run: handleQuoteLink,
                stats: [StatisticType.Command_Settings_QuoteLink]
            },
            {
                key: "quote-unlink",
                run: handleQuoteUnlink,
                stats: [StatisticType.Command_Settings_QuoteUnlink]
            },
            {
                key: "quote-link-list",
                run: handleQuoteLinkList,
                stats: [StatisticType.Command_Settings_QuoteLinkList]
            }
        ], [StatisticType.Command_Settings], client);
    }
}

// Subcommand handlers
/**
 * Display the settings for this guild
 * @param client
 * @param interaction
 */
const handleView = async (interaction: ChatInputCommandInteraction): Promise<InteractionReplyOptions> => {
    debug("Settings view subcommand called");

    debug("Getting guild settings from database");
    const gSettings = await guildSchema.getGuildSettings(interaction.guildId!);
    
    debug("Building embed");
    const messageEmbed = new EmbedBuilder()
        .setTitle("Settings")
        .setTimestamp(Date.now())
        .setColor(Colors.settingsEmbed)

    debug("Adding settings fields to embed");
    let setting: keyof GuildSettings;
    for (setting in gSettings) {
        const type = typeof gSettings[setting]!.value;
        if (type === "number" || type === "string") {
            messageEmbed.addFields({
                name: gSettings[setting]!.name,
                value: `${gSettings[setting]!.value.toString()} ${gSettings[setting]!.unit ?? ""}`
            });
        } else if (type === "boolean") {
            messageEmbed.addFields({
                name: gSettings[setting]!.name,
                value: gSettings[setting]!.value ? "true" : "false"
            });
        } else if (setting === "quoteLinkedGuilds") {
            messageEmbed.addFields({
                name: gSettings[setting]!.name,
                value: "Use `/settings quote-link-list` to view linked guilds (WIP)"
            });
        } else {
            messageEmbed.addFields({
                name: gSettings[setting]!.name,
                value: "Unknown type"
            });
        }
    }

    return {
        embeds: [messageEmbed],
        ephemeral: true
    };
}

/**
 * Edit a setting for this guild
 * @param client 
 * @param interaction
 */
const handleEdit = async (interaction: ChatInputCommandInteraction): Promise<InteractionReplyOptions> => {
    debug("Settings edit subcommand called");

    // Get the option values
    const setting = interaction.options.getString("setting", true);
    const numberValue = interaction.options.getNumber("number-value");

    debug("Changing setting");
    const result = await changeSetting(interaction.guildId!, setting, numberValue);

    debug("Building reply");
    switch (result) {
        case ChangeSettingResult.Changed_Number:
            return {
                content: "Updated setting " + setting + " to " + numberValue,
                ephemeral: true
            };
        case ChangeSettingResult.Missing_Number:
            return {
                content: "Please provide a number value",
                ephemeral: true
            };
        case ChangeSettingResult.Invalid_Setting:
            return {
                content: "Setting " + setting + " not found",
            }
        default:
            error(`ChangeSettingResult "${result}" not found`, interaction.client);
            return generalError;
    }
}

const handleQuoteLink = async (interaction: ChatInputCommandInteraction): Promise<InteractionReplyOptions> => {
    const linkedGuildId = interaction.options.getString("guild-id", true);

    guildSchema.addLinkedGuild(interaction.guildId!, linkedGuildId);

    const embedBuilder = new EmbedBuilder()
        .setTitle(`Linked guild ${linkedGuildId}`)
        .setDescription("IMPORTANT: Guild linking is required from both guilds.\nQuote linking will start working once the other guild links to this guild.\nIf the other guild is already linked, quote linking will start working immediately.")
        .setColor(Colors.settingsEmbed);

    return {
        embeds: [embedBuilder],
        ephemeral: true
    };
}

const handleQuoteUnlink = async (interaction: ChatInputCommandInteraction): Promise<InteractionReplyOptions> => {
    const linkedGuildId = interaction.options.getString("guild-id", true);

    guildSchema.removeLinkedGuild(interaction.guildId!, linkedGuildId);

    const embedBuilder = new EmbedBuilder()
        .setTitle(`Unlinked guild ${linkedGuildId}`)
        .setDescription("IMPORTANT: Unlinking a guild will also prevent the other guild from accessing quotes from this guild.")
        .setColor(Colors.settingsEmbed);

    return {
        embeds: [embedBuilder],
        ephemeral: true
    };
}

const handleQuoteLinkList = async (interaction: ChatInputCommandInteraction, client: Client): Promise<InteractionReplyOptions> => {
    const embedBuilder = new EmbedBuilder()
        .setTitle(`Linked guilds`)
        .setColor(Colors.settingsEmbed);
    
    const linkedGuilds = await guildSchema.listLinkedGuilds(interaction.guildId!);
    linkedGuilds.forEach((linkedGuild) => {
        let guildName = linkedGuild.guildId;
        if (client.guilds.cache.has(linkedGuild.guildId)) {
            guildName = client.guilds.cache.get(linkedGuild.guildId)!.name;
        }

        embedBuilder.addFields({
            name: guildName,
            value: linkedGuild.accepted ? "Accepted" : "Pending"
        });
    });

    return {
        embeds: [embedBuilder],
        ephemeral: true
    };
}
