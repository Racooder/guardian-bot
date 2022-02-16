const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const profileModel = require('../models/profileSchema');

module.exports = {
	guildOnly: true,
	data: new SlashCommandBuilder()
		.setName('quote')
		.setDescription('A quote command!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('new')
                .setDescription('Create a new quote')
                .addStringOption(option => option.setName('quote').setDescription('The quote text.').setRequired(true))
                .addUserOption(option => option.setName('autor').setDescription('The person who said the quote.')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('random')
                .setDescription('Get a random quote.')
                .addUserOption(option => option.setName('autor').setDescription('The person who said the quote.')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription('Search quotes by criterias.')
                .addUserOption(option => option.setName('autor').setDescription('The person who said the quote.').setRequired(true))),
	async execute(interaction) {
        const subcommand = interaction.options.getSubcommand(); 
        if (subcommand == 'new') {
            try {
                let author = interaction.options.getUser('autor');
                if (author) {
                    author = author.username;
                }
                let profile = await profileModel.create({
                    serverID: interaction.member.guild.id,
                    author: author,
                    quote: interaction.options.getString('quote')
                });
                profile.save();
                interaction.reply({ content: "Sucessfully saved the quote!", ephemeral: true });
            } catch (error) {
                console.log(error);
            }
            return;
        }
        if (subcommand == 'random') {
            var author = interaction.options.getUser('autor');
            if (author) {
                author = author.username;
            }

            profileModel.find({ serverID: interaction.member.guild.id }, function(err, quotes) 
            {
                if (author) {
                    quotes = quotes.filter(function(value, index, arr){
                        return value.author == author;
                    });
                }
                const result = quotes[Math.floor(Math.random()*quotes.length)];
                if (result) {
                    interaction.reply({embeds: [new MessageEmbed()
                        .setTitle(`"${result.quote}" - ${result.author == null ? 'anonymous' : result.author}`)
                    ]});
                } else {
                    interaction.reply({ content: "There is no quote from this author!", ephemeral: true });
                }
            });
            return;
        }
        if (subcommand == 'search') {
            const author = interaction.options.getUser('autor').username;

            profileModel.find({ author: author }, function(err, quotes) 
            {
                const quoteMessage = new MessageEmbed().setTitle(`Quotes by ${author}`);
                let description = "";
                for (const quote of quotes) {
                    description += `"${quote.quote}"\n\n`;
                }
                quoteMessage.setDescription(description);
                interaction.reply({embeds: [quoteMessage]});
            });
            return;
        }
	},
};