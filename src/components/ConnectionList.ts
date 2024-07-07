import { debug } from "../Log";
import { Component, ReplyType } from '../InteractionEssentials';
import { ButtonInteraction, ComponentType } from "discord.js";
import botUserModel from "../models/botUser";
import { connectionListMessage } from "../commands/Connections";

export const ConnectionList: Component<ButtonInteraction> = {
    name: "connection_list",
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
                const document = await botUserModel.findById(targetId);

                let responseContent = "";
                if (document === null) {
                    responseContent = "Unknown user or server";
                } else if (!botUser.following.includes(targetId)) {
                    responseContent = `You are not following ${document.name}`;
                } else {
                    botUser.following = botUser.following.filter((id) => id.toString() !== targetId);
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
