import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { Command } from "../InteractionInterface";
import { isGuildCommand } from "../Essentials";
import { generalError, noGuildError } from "../InteractionReplies";
import guildSchema, { IGuildSettings } from '../models/guildSchema';

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
        const permissions = interaction.member!.permissions as PermissionsBitField;
        if (!permissions.has(PermissionsBitField.Flags.ManageGuild | PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: "You do not have permission to use this command",
                ephemeral: true
            });
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "view") {
            handleView(client, interaction);
        } else if (subcommand === "edit") {
            handleEdit(client, interaction);
        }
    }
}

const handleView = async (client: Client, interaction: ChatInputCommandInteraction) => {
    if (!isGuildCommand(interaction)) {
        await interaction.reply(noGuildError);
        return;
    }

    const guildSettings = await guildSchema.getGuildSettings(interaction.guildId!);
    
    const messageEmbed = new EmbedBuilder()
        .setTitle("Settings")
        .setTimestamp(Date.now())
        .setColor(parseInt("D1D1D1", 16))

    let setting: keyof IGuildSettings;
    for (setting in guildSettings) {
        const type = typeof guildSettings[setting].value;
        if (type === "number" || type === "string") {
            messageEmbed.addFields({
                name: guildSettings[setting].name,
                value: `${guildSettings[setting].value.toString()} ${guildSettings[setting].unit ?? ""}`
            });
        } else if (type === "boolean") {
            messageEmbed.addFields({
                name: guildSettings[setting].name,
                value: guildSettings[setting].value ? "true" : "false"
            });
        } else if (setting === "quoteLinkedGuilds") {
            messageEmbed.addFields({
                name: guildSettings[setting].name,
                value: "Use `/quoteLink list` to view linked guilds (WIP)"
            });
        } else {
            messageEmbed.addFields({
                name: guildSettings[setting].name,
                value: "Unknown type"
            });
        }
    }

    await interaction.reply({
        embeds: [messageEmbed],
        ephemeral: true
    });
}

const handleEdit = async (client: Client, interaction: ChatInputCommandInteraction) => {
    if (!isGuildCommand(interaction)) {
        await interaction.reply(noGuildError);
        return;
    }

    const setting = interaction.options.getString("setting", true);
    const numberValue = interaction.options.getNumber("number-value");

    const guildSettings = await guildSchema.getGuildSettings(interaction.guildId!);

    let s: keyof IGuildSettings;
    for (s in guildSettings) {
        if (s == setting) {
            if (typeof guildSettings[s].value === "number") {
                if (numberValue === null) {
                    await interaction.reply({
                        content: "Please provide a number value",
                        ephemeral: true
                    });
                    return;
                } else {
                    guildSettings[s].value = numberValue;
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
