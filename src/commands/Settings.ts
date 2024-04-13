import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from "discord.js";
import { Command, ReplyType, Response } from '../Interactions';
import { debug } from "../Log";
import { SubcommandExecutionFailure } from "../Failure";
import { QuotePrivacy } from "../models/botUser";
import { RawStatistic } from "../models/statistic";
import statisticKeys from "../../data/statistic-keys.json";

export const Settings: Command = {
    name: "settings",
    description: "Change your settings.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "view",
            description: "View your settings.",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "change",
            description: "Change your settings.",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "quote_privacy",
                    description: "Change who can see your quotes.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "privacy",
                            description: "Who can see your quotes.",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                {
                                    name: "Public",
                                    value: "public"
                                },
                                {
                                    name: "Private",
                                    value: "private"
                                },
                                {
                                    name: "Two-way (only people you follow can see your quotes)",
                                    value: "two-way"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    run: async (client, interaction, botUser) => {
        debug("Settings command called");
        return new SubcommandExecutionFailure();
    },
    subcommandGroups: {
        change: {
            quote_privacy: async (client, interaction, botUser) => {
                debug("Settings change quote-privacy subcommand called");

                const privacy = interaction.options.getString("privacy", true);
                botUser.settings.quote_privacy = privacy as QuotePrivacy;
                botUser.markModified("settings");
                await botUser.save();

                const statistic: RawStatistic = {
                    global: false,
                    key: statisticKeys.bot.event.interaction.command.settings.change.quote_privacy,
                    user: botUser
                };

                const response: Response = {
                    replyType: ReplyType.Reply,
                    content: "Your quote privacy has been updated.",
                    ephemeral: true
                };

                return { response, statistic };
            }
        }
    },
    subcommands: {
        view: async (client, interaction, botUser) => {
            debug("Settings view subcommand called");

            const statistic: RawStatistic = {
                global: false,
                key: statisticKeys.bot.event.interaction.command.settings.view,
                user: botUser
            };

            const embedBuiler = new EmbedBuilder()
                .setTitle("Settings")
                .addFields({
                    name: "Quote Privacy",
                    value: botUser.settings.quote_privacy,
                    inline: true
                });

            const response: Response = {
                replyType: ReplyType.Reply,
                embeds: [embedBuiler],
                ephemeral: true
            };

            return { response, statistic };
        }
    },
};
