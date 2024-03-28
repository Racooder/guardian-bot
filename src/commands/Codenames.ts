import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { Command, ReplyType, Response } from '../Interactions';
import { debug } from "../Log";
import { RawStatistic } from "../models/statistic";
import statisticKeys from "../../data/statistic-keys.json"
import { addWord, getWord, getWords, removeWord } from "../models/codename";
import { RemoveWordFailure, SubcommandExecutionFailure } from "../Failure";

export const Codenames: Command = {
    name: "codenames",
    description: "Add words to the codenames wordpack",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "add",
            description: "Add a word to the codenames wordpack",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "word",
                    description: "The word to add",
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "remove",
            description: "Remove a word from the codenames wordpack",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "word",
                    description: "The word to remove",
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "wordpack",
            description: "Get the codenames wordpack",
        }
    ],
    run: async (client, interaction, botUser) => {
        debug("Codenames command called");
        return new SubcommandExecutionFailure();
    },
    subcommands: {
        add: async (client, interaction, botUser) => {
            debug("Codenames add subcommand called");

            const statistic: RawStatistic = {
                global: false,
                key: statisticKeys.bot.event.interaction.command.codenames.add,
                userId: botUser.id,
            };

            const word = interaction.options.getString("word", true);
            const document = await addWord(botUser.id, interaction.user, word);
            if (document === undefined) {
                const response: Response = {
                    replyType: ReplyType.Reply,
                    ephemeral: true,
                    content: `Word "${word}" already exists in the codenames wordpack`,
                };
                return { response, statistic };
            }

            const response: Response = {
                replyType: ReplyType.Reply,
                content: `Added word "${word}" to the codenames wordpack`,
                ephemeral: true,
            };
            return { response, statistic };
        },
        remove: async (client, interaction, botUser) => {
            debug("Codenames remove subcommand called");

            const statistic: RawStatistic = {
                global: false,
                key: statisticKeys.bot.event.interaction.command.codenames.remove,
                userId: botUser.id,
            };

            const word = interaction.options.getString("word", true);
            const document = await getWord(botUser.id, word);
            if (!document) {
                const response: Response = {
                    replyType: ReplyType.Reply,
                    ephemeral: true,
                    content: `Word "${word}" not found in the codenames wordpack`,
                };
                return { response, statistic };
            }

            if (interaction.inGuild()) {
                const isCreator = document.creator.userId === interaction.user.id;

                if (!isCreator) {
                    const response: Response = {
                        replyType: ReplyType.Reply,
                        ephemeral: true,
                        content: `You do not have permission to remove word "${word}" from the codenames wordpack`,
                    };
                    return { response, statistic };
                }
            }

            const removed = await removeWord(botUser.id, word);

            if (!removed) {
                return new RemoveWordFailure()
            }

            const response: Response = {
                replyType: ReplyType.Reply,
                ephemeral: true,
                content: `Removed word "${word}" from the codenames wordpack`,
            };
            return { response, statistic };
        },
        wordpack: async (client, interaction, botUser) => {
            debug("Codenames wordpack subcommand called");

            const statistic: RawStatistic = {
                global: false,
                key: statisticKeys.bot.event.interaction.command.codenames.wordpack,
                userId: botUser.id,
            };

            const codenames = await getWords(botUser.id);
            const words = codenames.map((codename) => codename.word);
            if (words.length === 0) {
                const response: Response = {
                    replyType: ReplyType.Reply,
                    ephemeral: true,
                    content: "No words found in the codenames wordpack",
                };
                return { response, statistic };
            }
            const buffer = Buffer.from(words.join("\n"), "utf-8");

            const response: Response = {
                replyType: ReplyType.Reply,
                files: [{
                    name: "wordpack.txt",
                    attachment: buffer,
                }],
            };
            return { response, statistic };
        },
    }
};
