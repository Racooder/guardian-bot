import { ApplicationCommandType } from "discord.js";
import { Command, ReplyType, Response } from "../Interactions";
import { debug } from "../Log";
import statisticKeys from "../../data/statistic-keys.json"
import { RawStatistic } from "../models/statistic";
import { FeatureNotImplementedFailure } from "../Failure";

export const Settings: Command = {
    name: "settings",
    description: "Change your settings.",
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction, botUser) => {
        debug("Settings command called");

        const statistic: RawStatistic = {
            global: false,
            key: statisticKeys.bot.event.interaction.command.settings,
            userId: botUser.id,
        };

        return new FeatureNotImplementedFailure();

        const response: Response = {
            replyType: ReplyType.Reply,
        };
        return { response, statistic };
    },
};
