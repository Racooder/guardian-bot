import mongoose, { Model, Schema, Document } from "mongoose";
import { debug } from "../Log";

export const enum StatisticType {
    Command = "Command",
    Command_Codenames = "Command_Codenames",
    Command_Codenames_AddWord = "Command_Codenames_AddWord",
    Command_Codenames_Wordpack = "Command_Codenames_Wordpack",
    Command_Feedback = "Command_Feedback",
    Command_Feedback_Bug = "Command_Feedback_Bug",
    Command_Feedback_Feature = "Command_Feedback_Feature",
    Command_Feedback_Other = "Command_Feedback_Other",
    Command_Ping = "Command_Ping",
    Command_Quote = "Command_Quote",
    Command_Quote_New = "Command_Quote_New",
    Command_Quote_List = "Command_Quote_List",
    Command_Quote_Search = "Command_Quote_Search",
    Command_Quote_Conversation = "Command_Quote_Conversation",
    Command_Quote_Edit = "Command_Quote_Edit",
    Command_QuoteGuesser = "Command_QuoteGuesser",
    Command_QuoteGuesser_Play = "Command_QuoteGuesser_Play",
    Command_QuoteGuesser_Leaderboard = "Command_QuoteGuesser_Leaderboard",
    Command_Settings = "Command_Settings",
    Command_Settings_View = "Command_Settings_View",
    Command_Settings_Edit = "Command_Settings_Edit",
    Command_Settings_QuoteLink = "Command_Settings_QuoteLink",
    Command_Settings_QuoteUnlink = "Command_Settings_QuoteUnlink",
    Command_Settings_QuoteLinkList = "Command_Settings_QuoteLinkList",
    Command_Kofi = "Command_Kofi",
    Component = "Component",
    Component_QuotePage = "Component_QuotePage",
    Component_QuoteGuesser = "Component_QuoteGuesser",
    Component_QuoteGuesser_Answer = "Component_QuoteGuesser_Answer",
    Component_QuoteGuesser_Next = "Component_QuoteGuesser_Next",
    Component_QuoteGuesser_Stop = "Component_QuoteGuesser_Stop",
    Event = "Event",
    Event_Ready = "Event_Ready",
    Event_Interaction = "Event_Interaction",
}

export type StatisticDictionary = {
    [key in StatisticType]: number;
};

/**
 * Represents a statistic value in the database.
 */
export interface IStatistic extends Document {
    types: StatisticType[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Holds the functions for the statistic schema.
 */
interface StatisticModel extends Model<IStatistic> {
    /**
     * Gets all statistic values between the given dates or all if no dates are given.
     * @param from - The start date.
     * @param to - The end date.
     * @returns The statistic values.
     */
    getAll: (from?: Date, to?: Date) => Promise<StatisticDictionary>;
}

/**
 * The database schema for a statistic value.
 */
const statisticSchema = new Schema<IStatistic, StatisticModel>(
    {
        types: {
            type: [String],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Gets all statistic values between the given dates or all if no dates are given.
 * @param from - The start date.
 * @param to - The end date.
 * @returns The statistic values.
 */
statisticSchema.statics.getAll = async function (
    from?: Date,
    to?: Date
): Promise<StatisticDictionary> {
    from = from || new Date(0);
    to = to || new Date();

    const statisticDocuments = await this.find({
        createdAt: {
            $gte: from,
            $lte: to,
        },
    });

    // Create a dictionary with all statistic types and set the value to 0
    const statisticDictionary: StatisticDictionary = {} as StatisticDictionary;

    statisticDocuments.forEach((statisticDocument) => {
        statisticDocument.types.forEach((type) => {
            if (!statisticDictionary[type]) {
                statisticDictionary[type] = 0;
            }
            statisticDictionary[type] += 1;
        });
    });

    return statisticDictionary;
};

/**
 * The guild model.
 */
const model = mongoose.model<IStatistic, StatisticModel>(
    "Statistics",
    statisticSchema
);
export default model;

export function updateStatistic(
    types: StatisticType[]
): Promise<IStatistic | null> {
    if (process.env.NODE_ENV === "development") {
        return Promise.resolve(null);
    }

    debug("Updating statistics");
    return model.create({
        types: types,
    });
}
