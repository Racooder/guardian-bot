import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { Command, ReplyType } from "../Interactions";
import { debug } from "../Log";
import { SubcommandExecutionFailure } from "../Failure";
import botUserModel, { BotUser, BotUserType } from "../models/botUser";
import statisticKeys from "../../data/statistic-keys.json";
import { RawStatistic } from "../models/statistic";
import followMenuModel, { FollowMenu } from "../models/followMenu";
import { clamp } from "../Essentials";

const TYPE_DISPLAY = {
    [BotUserType.USER]: "User",
    [BotUserType.GUILD]: "Server"
};

export const Connections: Command = {
    name: "connections",
    description: "Manage connections to other users and guilds",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "follow",
            description: "Follow a user or guild",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "name",
                    description: "The name of the user or guild",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "type",
                    description: "The target type",
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        {
                            name: "User",
                            value: "user"
                        },
                        {
                            name: "Server",
                            value: "guild"
                        }
                    ],
                    required: true
                }
            ]
        }
    ],
    run: async (client, interaction, botUser) => {
        debug("Quote command called");
        return new SubcommandExecutionFailure();
    },
    subcommands: {
        follow: async (client, interaction, botUser) => {
            debug("Follow subcommand called");

            const statistic: RawStatistic = {
                global: false,
                key: statisticKeys.bot.event.interaction.command.connections.follow,
                user: botUser
            };

            const name = interaction.options.getString("name", true);
            const type = interaction.options.getString("type", true) as BotUserType;

            let targets = await botUserModel.find({ name, type });
            removeSelfFromTargets(targets, botUser);
            const extendedSearch = targets.length === 0;

            if (extendedSearch) {
                targets = await botUserModel.find({ name: { $regex: new RegExp(name, "i") }});
                removeSelfFromTargets(targets, botUser);
                if (targets.length === 0) {
                    const response = {
                        content: "No user or guild found with that name and type",
                        ephemeral: true,
                        replyType: ReplyType.Reply
                    }
                    return { response, statistic };
                }
            }

            const document = await followMenuModel.create({ targets, extendedSearch });
            const [embed, actionRow] = followMenuMessage(document);
            const response = {
                embeds: [embed],
                components: [actionRow],
                replyType: ReplyType.Reply
            };
            return { response, statistic };
        }
    }
};

export function followMenuMessage(document: FollowMenu, page = 0): [EmbedBuilder, ActionRowBuilder<ButtonBuilder>] {
    debug("Creating follow menu message");

    clamp(page, 0, document.targets.length - 1);

    const target = document.targets[page] as BotUser;

    const embedBuilder = new EmbedBuilder()
        .setAuthor({
            name: `Found ${document.targets.length} matching target ${document.targets.length === 1 ? "" : "s"}`,
        })
        .setTitle(target.name)

    let targetDescription = `Type: ${TYPE_DISPLAY[target.type]}`;
    if (target.type === BotUserType.GUILD) {
        targetDescription += `\nMember count: ${target.memberCount}`;
    }
    embedBuilder.setDescription(targetDescription);

    if (document.extendedSearch) {
        embedBuilder.setFooter({
            text: "No exact matches found, showing similar results."
        })
    }

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`follow-menu:page:${document._id}:${page - 1}`)
                .setLabel('◀️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 0),
            new ButtonBuilder()
                .setCustomId(`follow-menu:page:${document._id}:${page + 1}`)
                .setLabel('▶️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === document.targets.length - 1),
            new ButtonBuilder()
                .setCustomId(`follow-menu:follow:${target._id}`)
                .setLabel("Follow")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("🔗")
        ) as ActionRowBuilder<ButtonBuilder>;

    return [embedBuilder, actionRow];
}

function removeSelfFromTargets(targets: BotUser[], botUser: BotUser): BotUser[] {
    debug("Removing self from targets");

    const indexOfSelf = targets.map(t => t.id).indexOf(botUser.id);
    if (indexOfSelf > -1) {
        targets.splice(indexOfSelf, 1);
    }
    return targets;
}
