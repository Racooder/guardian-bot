import { debug } from "../Log";
import { Component, ReplyType } from '../InteractionEssentials';
import { ButtonInteraction, ComponentType } from "discord.js";
import botUserModel, { BotUserDoc } from "../models/botUser";
import { connectionListMessage } from "../commands/Connections";
import { Types } from "mongoose";
import followMenuModel, { FollowMenuDoc } from "../models/followMenu";
import { followMenuMessage } from "../commands/Connections";

export const BtnConnectionList: Component<ButtonInteraction> = {
    name: "btn_connection_list",
    type: ComponentType.Button,
    subcomponents: {
        page: {
            run: async (client, interaction, botUser, data) => {
                debug("ConnectionList page button pressed");

                const page = parseInt(data[0]);
                const [embed, actionRow] = await connectionListMessage(botUser, page);

                return {
                    replyType: ReplyType.Update,
                    embeds: [embed],
                    components: [actionRow],
                };
            },
        },
        unfollow: {
            run: async (client, interaction, botUser, data) => {
                debug("ConnectionList unfollow button pressed");

                const targetId = data[0];
                const document = await botUserModel
                    .findById(targetId)
                    .exec() as BotUserDoc | null;

                let responseContent = "";
                const following = botUser.following as Types.ObjectId[];
                if (document === null) {
                    responseContent = "Unknown user or server";
                } else if (!following.some((id) => id.equals(document._id as Types.ObjectId))){
                    responseContent = `You are not following ${document.name}`;
                } else {
                    botUser.following = following.filter((id) => id.toString() !== targetId);
                    await botUser.save();
                    responseContent = `Successfully unfollowed ${document.name}`;
                }

                return {
                    replyType: ReplyType.Update,
                    content: responseContent,
                    embeds: [],
                    components: [],
                    ephemeral: true,
                };
            }
        }
    },
};

export const BtnFollowMenu: Component<ButtonInteraction> = {
    name: "btn_follow_menu",
    type: ComponentType.Button,
    subcomponents: {
        page: {
            run: async (client, interaction, botUser, data) => {
                debug("FollowMenu page button pressed");

                const document = await followMenuModel
                    .findById(data[0])
                    .exec() as FollowMenuDoc | null;

                if (document) {
                    const page = parseInt(data[1]);
                    const [embed, actionRow] = await followMenuMessage(botUser, document, page);

                    return {
                        replyType: ReplyType.Update,
                        embeds: [embed],
                        components: [actionRow],
                    };
                }

                return {
                    replyType: ReplyType.Update,
                    content: "This follow menu has expired",
                    embeds: [],
                    components: [],
                    ephemeral: true,
                };
            },
        },
        follow: {
            run: async (client, interaction, botUser, data) => {
                debug("FollowMenu follow button pressed");
                const targetDocument = await botUserModel
                    .findById(data[0])
                    .exec() as BotUserDoc | null;

                let responseContent = "Could not find the user or server you were looking for";
                const following = botUser.following as Types.ObjectId[];
                if (targetDocument) {
                    responseContent = `Successfully followed **${targetDocument.name}**`;
                    if (!following.some((id) => id.equals(targetDocument._id as Types.ObjectId))) {
                        botUser.following.push(targetDocument._id);
                    }
                    await botUser.save();
                }

                return {
                    replyType: ReplyType.Update,
                    content: responseContent,
                    embeds: [],
                    components: [],
                    ephemeral: true,
                };
            }
        }
    },
};
