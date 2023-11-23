import { Model, Schema, Document, model } from "mongoose";

export const StatisticKey = {
    Command: {
        Codenames: {
            AddWord: "Command_Codenames_AddWord",
            Wordpack: "Command_Codenames_Wordpack",
        },
        Feedback: {
            Bug: "Command_Feedback_Bug",
            Feature: "Command_Feedback_Feature",
            Other: "Command_Feedback_Other",
        },
        Kofi: "Command_Kofi",
        Ping: "Command_Ping",
        Quote: {
            New: "Command_Quote_New",
            List: "Command_Quote_List",
            Search: "Command_Quote_Search",
            Conversation: "Command_Quote_Conversation",
            Edit: "Command_Quote_Edit",
        },
        QuoteGuesser: {
            Play: "Command_QuoteGuesser_Play",
            Leaderboard: "Command_QuoteGuesser_Leaderboard",
        },
        Settings: {
            View: "Command_Settings_View",
            Edit: "Command_Settings_Edit",
            GuildLink: "Command_Settings_GuildLink",
            GuildUnlink: "Command_Settings_GuildUnlink",
            GuildLinkList: "Command_Settings_GuildLinkList",
        },
    },
    Component: {
        QuoteGuesser: {
            Answer: "Component_QuoteGuesser_Answer",
            Next: "Component_QuoteGuesser_Next",
            Stop: "Component_QuoteGuesser_Stop",
        },
        QuotePage: "Component_QuotePage",
    },
    Event: {
        Interaction: "Event_Interaction",
        Ready: "Event_Ready",
    },
}

export interface IStatistic extends Document {
    type: string;
    createdAt: Date;
    updatedAt: Date;
}

interface StatisticModel extends Model<IStatistic> {}

const statisticSchema = new Schema<IStatistic, StatisticModel>(
    {
        type: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const statisticModel = model<IStatistic, StatisticModel>("Statistic", statisticSchema);

export default statisticModel;

export function updateStatistic(type: string) {
    const statistic = new statisticModel({ type });
    statistic.save();
}
