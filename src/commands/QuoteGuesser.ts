import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, InteractionReplyOptions, GuildMember } from "discord.js";
import { Command } from "../InteractionInterface";
import { generalError, noGuildError } from "../InteractionReplies";
import { isGuildCommand } from "../Essentials";
import quoteSchema from "../models/quoteSchema";
import quoteGuesserSchema from "../models/quoteGuesserSchema";
import guildMemberSchema from "../models/guildMemberSchema";

export const QuoteGuesser: Command = {
    name: "quote-guesser",
    description: "Play different games with your friends",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "play",
            description: "Start a game of quote guesser"
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "answer",
            description: "Guess who said the quote",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "token",
                    description: "The token of the game you want to answer",
                    required: true
                },
                {
                    type: ApplicationCommandOptionType.User,
                    name: "author",
                    description: "The user you think said the quote",
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "author-name",
                    description: "The name of the user you think said the quote",
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "leaderboard",
            description: "View the leaderboard for quote guesser"
        }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) {
            await interaction.reply(generalError);
            return;
        }
        if (!isGuildCommand(interaction)) {
            await interaction.reply(noGuildError);
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "play":
                handlePlay(interaction);
                break;
            case "answer":
                handleAnswer(interaction);
                break;
            case "leaderboard":
                handleLeaderboard(interaction);
                break;
        }
    }
}

const handlePlay = async (interaction: ChatInputCommandInteraction) => {
    if (!isGuildCommand(interaction)) {
        await interaction.reply(noGuildError);
        return;
    }

    do {
        var token = newToken();
    } while (await quoteGuesserSchema.exists({ token: token }));

    const quote = await quoteSchema.randomQuote(interaction.guildId!);

    if (quote === undefined) {
        await interaction.reply({ content: "There are no quotes on this server", ephemeral: true });
        return;
    }

    const document = await quoteGuesserSchema.create({
        guildId: interaction.guildId,
        token: token,
        quote: quote.quote,
        authorId: quote.author?.userId,
        authorName: await quote.authorName,
        authorAlias: quote.author?.username
    })

    const embed = new EmbedBuilder()
        .setTitle(`Who said this quote? (Token \`${token}\`)`)
        .setDescription(`"${quote.quote}" - Unknown`)
        .setFooter({ text: `To answer, use \`/quote-guesser answer ${token} <user>\` or \`/quote-guesser answer ${token} <name>\`` })

    const stopButton = new ButtonBuilder()
        .setCustomId(`stopQuoteGuesser:${token}`)
        .setLabel("Stop")
        .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder()
        .addComponents(stopButton);

    await interaction.reply({ 
        embeds: [embed], 
        components: [row] 
    } as InteractionReplyOptions);
}

const handleAnswer = async (interaction: ChatInputCommandInteraction) => {
    if (!isGuildCommand(interaction)) {
        await interaction.reply(noGuildError);
        return;
    }

    const token = interaction.options.getString("token", true);
    const user = interaction.options.getUser("author");
    const name = interaction.options.getString("author-name");

    if (user === null && name === null) {
        await interaction.reply({ content: "You must provide either a author or a author-name", ephemeral: true });
        return;
    }

    if (!(interaction.member instanceof GuildMember)) {
        await interaction.reply({ content: "You are not a member of this server", ephemeral: true });
        return;
    }
    const result = await quoteGuesserSchema.addAnswer(interaction.guildId!, token, interaction.member, {
        authorId: user?.id,
        authorName: name ?? undefined
    })

    interaction.reply({ content: result, ephemeral: true });
}

const handleLeaderboard = async (interaction: ChatInputCommandInteraction) => {
    if (!isGuildCommand(interaction)) {
        await interaction.reply(noGuildError);
        return;
    }

    const guildMembers = await guildMemberSchema.find({ guildId: interaction.guildId });

    const ranking = guildMembers.sort((a, b) => (b.quoteGuesserScore || 0) - (a.quoteGuesserScore || 0)).slice(0, 10);

    const embed = new EmbedBuilder()
        .setTitle("Quote Guesser Leaderboard")
        .setDescription(ranking.map((member, index) => `${index + 1}. ${member.displayName ?? member.username} - ${member.quoteGuesserScore ?? 0}`).join("\n"));

    await interaction.reply({ embeds: [embed] });
}

const newToken = () => {
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    const length = characters.length;
    let token = "";
    for (let i = 0; i < 6; i++) {
        token += characters.charAt(Math.floor(Math.random() * length));
    }
    return token;
}
