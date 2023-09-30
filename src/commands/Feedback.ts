import {
    CommandInteraction,
    Client,
    ApplicationCommandType,
    ApplicationCommandOptionType,
} from "discord.js";
import { Command } from "../InteractionInterfaces";
import { generalError } from "../InteractionReplies";
import { handleSubcommands, isGuildCommand } from "../Essentials";
import { debug, error } from "../Log";
import feedbackSchema from "../models/feedbackSchema";
import guildMemberSchema, { IGuildMember } from "../models/guildMemberSchema";
import { StatisticType } from "../models/statisticsSchema";

export const Feedback: Command = {
    name: "feedback",
    description: "Send feedback to the bot developer",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "bug",
            description: "Report a bug",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "description",
                    description: "The bug description",
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "feature",
            description: "Request a feature",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "description",
                    description: "The feature description",
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "other",
            description: "Other feedback",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "description",
                    description: "The feedback description",
                    required: true,
                },
            ],
        },
    ],
    run: async function (client: Client, interaction: CommandInteraction) {
        debug("Feedback command called");

        if (!interaction.isChatInputCommand()) {
            error("Feedback command was not a chat input command", client);
            await interaction.reply(generalError);
            return;
        }

        // Get the option values
        const feedbackType = interaction.options.getSubcommand();
        const feedbackDescription = interaction.options.getString(
            "description",
            true
        );

        let creatorDocument: IGuildMember | null = null;
        if (isGuildCommand(interaction)) {
            debug("Updating creator name in the database");
            creatorDocument = await guildMemberSchema.updateNames(
                interaction.guildId!,
                interaction.user
            );
        }

        debug("Creating feedback document");
        await feedbackSchema.create({
            type: feedbackType,
            description: feedbackDescription,
            creator: creatorDocument?._id,
            creatorId: interaction.user.id,
            creatorName: interaction.user.username,
        });

        await handleSubcommands(
            interaction,
            feedbackType,
            [
                {
                    key: "bug",
                    run: handleBug,
                    stats: [StatisticType.Command_Feedback_Bug],
                },
                {
                    key: "feature",
                    run: handleFeature,
                    stats: [StatisticType.Command_Feedback_Feature],
                },
                {
                    key: "other",
                    run: handleOther,
                    stats: [StatisticType.Command_Feedback_Other],
                },
            ],
            [StatisticType.Command_Feedback],
            feedbackDescription
        );
    },
};

async function handleBug(interaction: CommandInteraction, args: string) {
    return {
        content: "Bug reported",
        ephemeral: true,
    };
}

async function handleFeature(interaction: CommandInteraction, args: string) {
    return {
        content: "Feature requested",
        ephemeral: true,
    };
}

async function handleOther(interaction: CommandInteraction, args: string) {
    return {
        content: "Feedback sent",
        ephemeral: true,
    };
}
