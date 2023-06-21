import mongoose, { Model, Schema, Document } from "mongoose";

export const enum StatisticType {
    Command = "Command",
        Command_Ping = "Command_Ping",
        Command_Feedback = "Command_Feedback",
        Command_Settings = "Command_Settings",
        Command_Quote = "Command_Quote",
        Command_QuoteGuesser = "Command_QuoteGuesser",
        Command_Codenames = "Command_Codenames",
    Component = "Component",
    Component_QuotePage = "Component_QuotePage",
    Component_QuoteGuesser = "Component_QuoteGuesser",
        Component_QuoteGuesser_Answer = "Component_QuoteGuesser_Answer",
        Component_QuoteGuesser_Next = "Component_QuoteGuesser_Next",
        Component_QuoteGuesser_Stop = "Component_QuoteGuesser_Stop",
    Event = "Event",
        Event_Ready = "Event_Ready",
        Event_Interaction = "Event_Interaction",
            Event_Interaction_SlashCommand = "Event_Interaction_SlashCommand",
            Event_Interaction_Component = "Event_Interaction_Component",
}

export type StatisticDictionary = {
    [key in StatisticType]: number;
}

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
const statisticSchema = new Schema<IStatistic, StatisticModel>({
    types: {
        type: [String],
        required: true
    },
}, {
    timestamps: true
});

/**
     * Gets all statistic values between the given dates or all if no dates are given.
     * @param from - The start date.
     * @param to - The end date.
     * @returns The statistic values.
     */
statisticSchema.statics.getAll = async function (from?: Date, to?: Date): Promise<StatisticDictionary> {
    from = from || new Date(0);
    to = to || new Date();
    
    const statisticDocuments = await this.find({
        createdAt: {
            $gte: from,
            $lte: to
        }
    });

    const statisticDictionary: StatisticDictionary = {
        Command: 0,
            Command_Ping: 0,
            Command_Feedback: 0,
            Command_Settings: 0,
            Command_Quote: 0,
            Command_QuoteGuesser: 0,
            Command_Codenames: 0,
        Component: 0,
        Component_QuotePage: 0,
        Component_QuoteGuesser: 0,
            Component_QuoteGuesser_Answer: 0,
            Component_QuoteGuesser_Next: 0,
            Component_QuoteGuesser_Stop: 0,
        Event: 0,
            Event_Ready: 0,
            Event_Interaction: 0,
                Event_Interaction_SlashCommand: 0,
                Event_Interaction_Component: 0,
    };

    statisticDocuments.forEach((statisticDocument) => {
        statisticDocument.types.forEach((type) => {
            statisticDictionary[type] += 1;
        });
    });

    return statisticDictionary;
};

/**
 * The guild model.
 */
export default mongoose.model<IStatistic, StatisticModel>("Statistics", statisticSchema);
