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
 * The guild model.
 */
export default mongoose.model<IStatistic, StatisticModel>("Statistics", statisticSchema);
