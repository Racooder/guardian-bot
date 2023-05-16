import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { Command } from "../InteractionInterface";
import { isGuildCommand } from "../Essentials";
import { generalError, noGuildError } from "../InteractionReplies";
import guildSchema, { IGuildSettings } from '../models/guildSchema';
import Colors from 'src/Colors';

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
        }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) {
            await interaction.reply(generalError);
            return;
        }
        if (!isGuildCommand(interaction)) {
            await interaction.reply(noGuildError);
        }

        // Check if the user has permission to use this command
        const permissions = interaction.member!.permissions as PermissionsBitField;
        if (!permissions.has(PermissionsBitField.Flags.ManageGuild | PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: "You do not have permission to use this command",
                ephemeral: true
            });
            return;
        }

        // Handle subcommands
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "view":
                handleView(interaction);
                break;
            case "edit":
                handleEdit(interaction);
                break;
            default:
                await interaction.reply(generalError);
                break;
        }
    }
}

// Subcommand handlers
/**
 * Display the settings for this guild
 * @param client
 * @param interaction
 */
const handleView = async (interaction: ChatInputCommandInteraction): Promise<void> => {
    if (!isGuildCommand(interaction)) {
        await interaction.reply(noGuildError);
        return;
    }

    // Get the settings for this guild
    const guildSettings = await guildSchema.getGuildSettings(interaction.guildId!);
    
    // Create the embed
    const messageEmbed = new EmbedBuilder()
        .setTitle("Settings")
        .setTimestamp(Date.now())
        .setColor(Colors.settingsEmbed)

    // Add the settings to the embed
    let setting: keyof IGuildSettings;
    for (setting in guildSettings) {
        const type = typeof guildSettings[setting]!.value;
        if (type === "number" || type === "string") {
            messageEmbed.addFields({
                name: guildSettings[setting]!.name,
                value: `${guildSettings[setting]!.value.toString()} ${guildSettings[setting]!.unit ?? ""}`
            });
        } else if (type === "boolean") {
            messageEmbed.addFields({
                name: guildSettings[setting]!.name,
                value: guildSettings[setting]!.value ? "true" : "false"
            });
        } else if (setting === "quoteLinkedGuilds") {
            messageEmbed.addFields({
                name: guildSettings[setting]!.name,
                value: "Use `/quoteLink list` to view linked guilds (WIP)"
            });
        } else {
            messageEmbed.addFields({
                name: guildSettings[setting]!.name,
                value: "Unknown type"
            });
        }
    }

    // Send the embed
    await interaction.reply({
        embeds: [messageEmbed],
        ephemeral: true
    });
}

/**
 * Edit a setting for this guild
 * @param client 
 * @param interaction
 */
const handleEdit = async (interaction: ChatInputCommandInteraction): Promise<void> => {
    if (!isGuildCommand(interaction)) {
        await interaction.reply(noGuildError);
        return;
    }

    // Get the option values
    const setting = interaction.options.getString("setting", true);
    const numberValue = interaction.options.getNumber("number-value");

    // Get the settings for this guild
    const guildSettings = await guildSchema.getGuildSettings(interaction.guildId!);

    // Change the setting if it exists
    let s: keyof IGuildSettings;
    for (s in guildSettings) {
        if (s == setting) {
            if (typeof guildSettings[s]!.value === "number") {
                // Check if a valid new value was provided
                if (numberValue === null) {
                    await interaction.reply({
                        content: "Please provide a number value",
                        ephemeral: true
                    });
                    return;
                } else {
                    // Update the setting
                    guildSettings[s]!.value = numberValue;
                    await guildSchema.updateGuildSettings(interaction.guildId!, guildSettings);
                    await interaction.reply({
                        content: "Updated setting " + s + " to " + numberValue,
                        ephemeral: true
                    });
                }
            }
        }
    }
}
