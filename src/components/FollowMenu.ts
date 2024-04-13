import { debug } from "../Log";
import { Component, ReplyType, Response } from '../Interactions';
import { UnknownFollowMenuDataFailure } from "../Failure";
import { ButtonInteraction, ComponentType } from "discord.js";
import { RawStatistic } from "../models/statistic";
import statisticKeys from "../../data/statistic-keys.json";
import followMenuModel from "../models/followMenu";
import { followMenuMessage } from "../commands/Connections";
import botUserModel from "../models/botUser";

export const FollowMenu: Component<ButtonInteraction> = {
    name: "follow-menu",
    type: ComponentType.Button,
    run: async (client, interaction, botUser, data) => {
        debug("FollowMenu component called");

        const statistic: RawStatistic = {
            global: false,
            key: statisticKeys.bot.event.interaction.component.followMenu,
            user: botUser
        };

        let responseContent = "";
        switch (data[0]) {
            case "page":
                debug("FollowMenu page button pressed");
                const document = await followMenuModel.findById(data[1]);

                if (document) {
                    const page = parseInt(data[2]);
                    const [embed, actionRow] = followMenuMessage(document, page);

                    const response: Response = {
                        replyType: ReplyType.Update,
                        embeds: [embed],
                        components: [actionRow],
                    };
                    return { response, statistic };
                }

                responseContent = "This follow menu has expired";
                break;
            case "follow":
                debug("FollowMenu follow button pressed");
                const targetDocument = await botUserModel.findById(data[1]);

                if (!targetDocument) {
                    responseContent = "Could not find the user or server you were looking for";
                    break;
                }

                botUser.following.push(targetDocument);
                await botUser.save();
                responseContent = `Successfully followed **${targetDocument.name}**`;
                break;
            default:
                return new UnknownFollowMenuDataFailure();
        }

        const response: Response = {
            replyType: ReplyType.Update,
            content: responseContent,
            embeds: [],
            components: [],
            ephemeral: true,
        };

        return { response, statistic };
    },
};
