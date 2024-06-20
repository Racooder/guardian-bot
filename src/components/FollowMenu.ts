import { debug } from "../Log";
import { Component, ReplyType } from '../InteractionEssentials';
import { ButtonInteraction, ComponentType } from "discord.js";
import followMenuModel from "../models/followMenu";
import { followMenuMessage } from "../commands/Connections";
import botUserModel from "../models/botUser";

export const FollowMenu: Component<ButtonInteraction> = {
    name: "follow_menu",
    type: ComponentType.Button,
    subcomponents: {
        page: {
            run: async (client, interaction, botUser, data) => {
                debug("FollowMenu page button pressed");

                const document = await followMenuModel.findById(data[0]);

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
                const targetDocument = await botUserModel.findById(data[0]);

                let responseContent = "Could not find the user or server you were looking for";
                if (targetDocument) {
                    responseContent = `Successfully followed **${targetDocument.name}**`;
                    if (!botUser.following.includes(targetDocument.id)) {
                        botUser.following.push(targetDocument);
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
