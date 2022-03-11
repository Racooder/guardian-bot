// * Imports
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const profileModel = require('../models/profileSchema');

module.exports = {
    /**
     * If the command is only available for guilds
     */
	guildOnly: true,
    /**
     * The SlashCommandBuilder
     */
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
                .addUserOption(option => option.setName('autor').setDescription('The person who said the quote.'))),
    /**
     * Executes the quote command
     * @param {Object} interaction - The interaction object
     */
	async execute(interaction) {
        const subcommand = interaction.options.getSubcommand(); 

        switch (subcommand) {
            case 'new': {
                try {
                    let author = interaction.options.getUser('autor');
                    let authorName;
                    let authorId;
                    if (author) {
                        authorName = author.username;
                        authorId = author.id;
                    }
                    let profile = await profileModel.create({
                        serverID: interaction.member.guild.id,
                        author: authorName,
                        authorId: authorId,
                        quote: interaction.options.getString('quote'),
                        timestamp: parseInt(Date.now() / 1000),
                        creator: interaction.user.username,
                        creatorId: interaction.user.id
                    });
                    profile.save();
                    await interaction.reply({ content: "Sucessfully saved the quote!", ephemeral: true });
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
                return;
            }
            case 'random': {
                let author = interaction.options.getUser('autor');
                let authorName;
                let authorId;
                if (author) {
                    authorName = author.username;
                    authorId = author.id;
                }

                profileModel.find({ serverID: interaction.member.guild.id }, async function(err, quotes) 
                {
                    if (author) {
                        quotes = quotes.filter(function(value, index, arr){
                            return value.authorId == authorId;
                        });
                    }
                    const result = quotes[Math.floor(Math.random()*quotes.length)];
                    if (result) {
                        let authorText;
                        if (interaction.member.guild.members.cache.find(user => user.id == result.authorId))
                        {
                            authorText = await interaction.member.guild.members.fetch(result.authorId);
                            authorText = authorText.displayName;
                        }
                        else
                        {
                            authorText = !result.author ? 'anonymous' : result.author;
                        }

                        const embed = new MessageEmbed()
                            .setTitle(`"${result.quote}" - ${authorText}`)
                        if (result.timestamp) {
                            embed.setDescription(`Created at <t:${result.timestamp}:d>`);
                        }
                            
                        interaction.reply({embeds: [embed]});
                    } else {
                        interaction.reply({ content: "There is no quote from this author!", ephemeral: true });
                    }
                });
                return;
            }
            case 'search': {
                let author = interaction.options.getUser('autor');
                let authorName;
                let authorId;
                if (author) {
                    authorName = author.username;
                    authorId = author.id;
                }

                profileModel.find({ serverID: interaction.member.guild.id }, async function(err, quotes) 
                {
                    if (author) {
                        quotes = quotes.filter(function(value, index, arr){
                            return value.authorId == authorId;
                        });

                        if (quotes.length == 0){
                            interaction.reply({ content: "There is no quote from this author!", ephemeral: true });
                            return;
                        }
                    }

                    const quoteMessage = new MessageEmbed().setTitle("Your searched quotes");

                    for (const quote of quotes) {
                        let authorText;
                        if (interaction.member.guild.members.cache.find(user => user.id == quote.authorId))
                        {
                            authorText = await interaction.member.guild.members.fetch(quote.authorId);
                            authorText = authorText.displayName;
                        }
                        else
                        {
                            authorText = !quote.author ? 'anonymous' : quote.author;
                        }

                        quoteMessage.addField(`"${quote.quote}" - ${authorText}`, `Created at <t:${quote.timestamp}:d>`);
                    }
                    interaction.reply({embeds: [quoteMessage]});
                });
                return;
            }
        }
        
        console.warn("Inexisting subcommand of the quote command!");
        return await interaction.reply({ content: "This subcommand doesn't exists!", ephemeral: true });
	},
};