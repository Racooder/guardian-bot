import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { Command, ReplyType } from "../InteractionEssentials";
import { debug } from "../Log";
import botUserModel, { BotUser, BotUserType } from "../models/botUser";
import followMenuModel, { FollowMenu } from "../models/followMenu";

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
        },
    ],
    subcommands: {
        follow: {
            run: async (client, interaction, botUser) => {
                debug("Follow subcommand called");

                const name = interaction.options.getString("name", true);
                const type = interaction.options.getString("type", true) as BotUserType;

                let targets = await botUserModel.find({ name, type });
                removeSelfFromTargets(targets, botUser);
                const extendedSearch = targets.length === 0;

                if (extendedSearch) {
                    targets = await botUserModel.find({ name: { $regex: new RegExp(name, "i") } });
                    removeSelfFromTargets(targets, botUser);
                    if (targets.length === 0) {
                        return {
                            content: "No user or guild found with that name and type",
                            ephemeral: true,
                            replyType: ReplyType.Reply
                        }
                    }
                }

                const document = await followMenuModel.create({ targets, extendedSearch });
                const [embed, actionRow] = await followMenuMessage(botUser, document);
                return {
                    embeds: [embed],
                    components: [actionRow],
                    replyType: ReplyType.Reply
                };
            },
        },
    }
};

export async function followMenuMessage(botUser: BotUser, document: FollowMenu, page = 0): Promise<[EmbedBuilder, ActionRowBuilder<ButtonBuilder>]> {
    debug("Creating follow menu message");

    const targetId = document.targets[page]._id;
    const target = await botUserModel.findById(targetId);
    const followed = botUser.following.includes(targetId);

    const embedBuilder = new EmbedBuilder()
        .setAuthor({
            name: `Found ${document.targets.length} matching target ${document.targets.length === 1 ? "" : "s"}`,
        })

    if (target === null) {
        embedBuilder.setTitle("Unknown user or server");
        embedBuilder.setDescription("The data for this user or server could not be found");
    } else {
        embedBuilder.setTitle(target.name + (followed ? " (followed)" : ""));
        let targetDescription = `Type: ${TYPE_DISPLAY[target.type]}`;
        if (target.type === BotUserType.GUILD) {
            targetDescription += `\nMember count: ${target.memberCount}`;
        }
        embedBuilder.setDescription(targetDescription);
    }

    if (document.extendedSearch) {
        embedBuilder.setFooter({
            text: "No exact matches found, showing similar results."
        })
    }

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`follow_menu;page;${document._id};${page - 1}`)
                .setEmoji('◀️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 0),
            new ButtonBuilder()
                .setCustomId(`follow_menu;page;${document._id};${page + 1}`)
                .setEmoji('▶️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === document.targets.length - 1),
            new ButtonBuilder()
                .setCustomId(`follow_menu;follow;${targetId}`)
                .setLabel("Follow")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(target === null || followed)
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
