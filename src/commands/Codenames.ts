import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType, ChatInputCommandInteraction, InteractionReplyOptions, GuildMember } from "discord.js";
import { Command } from "../InteractionInterfaces";
import { generalError, noGuildError } from "../InteractionReplies";
import { handleSubcommands, isGuildCommand } from "../Essentials";
import codenamesSchema from "../models/codenamesSchema";
import guildMemberSchema from "../models/guildMemberSchema";
import { debug, error } from '../Log';

export const Codenames: Command = {
    name: "codenames",
    description: "Add words to the server wordpack",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "add-word",
            description: "Add a word to the server wordpack",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "word",
                    description: "The word to add",
                    required: true,
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "wordpack",
            description: "Get the server wordpack",
        }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        debug("Codenames command called");

        if (!interaction.isChatInputCommand()) {
            error("Codenames command was not a chat input command", client);
            await interaction.reply(generalError);
            return;
        }
        if (!isGuildCommand(interaction)) {
            debug("Codenames command was not a guild command"); // This happens when the command is run in a DM
            await interaction.reply(noGuildError);
            return;
        }

        await handleSubcommands(interaction, interaction.options.getSubcommand(), [
            {
                key: "add-word",
                run: handleAddWord
            },
            {
                key: "wordpack",
                run: handleGetPack
            }
        ]);
    }
}

// Subcommand handlers
/**
 * Create a new game of quote guesser
 * @param interaction
 */
const handleAddWord = async (interaction: ChatInputCommandInteraction): Promise<InteractionReplyOptions> => {
    debug("Codenames add-word subcommand called");

    // Get the option values
    const word = interaction.options.getString("word", true);

    debug("Updating creator name in the database");
    const creatorDocument = await guildMemberSchema.updateNames(interaction.guildId!, interaction.member as GuildMember);

    debug(`Creating codenames word "${word}" in guild: ${interaction.guild!.name}(${interaction.guildId})`);
    try {
        await codenamesSchema.create({
            guildId: interaction.guildId,
            word: word,
            creator: creatorDocument._id,
        });
    } catch (error: any) {
        if (error.code === 11000) {
            debug(`Codenames word already exists`);
            return {
                content: `The word "${word}" is already in the server wordpack`,
                ephemeral: true,
            };
        } else {
            error(error, interaction.client);
            return generalError;
        }
    }

    debug("Codenames word created");
    return {
        content: `Added the word "${word}" to the server wordpack`,
        ephemeral: true,
    };
}

/**
 * Display the leaderboard for quote guesser
 * @param interaction
 */
const handleGetPack = async (interaction: ChatInputCommandInteraction): Promise<InteractionReplyOptions> => {
    debug("Codenames wordpack subcommand called");

    debug("Generating wordpack buffer");
    const words = await codenamesSchema.listQuotes(interaction.guildId!);
    const buffer = Buffer.from(words.join("\n"), "utf-8");

    debug("Sending wordpack buffer");
    return{
        files: [{
            attachment: buffer,
            name: `wordpack-${interaction.guild!.name}.txt`,
        }],
        ephemeral: true,
    };
}
