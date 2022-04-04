// * Imports
const { SlashCommandBuilder, quote } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const profileModel = require('../models/profileSchema');
const textSimilarity = require('../textSimilarity');

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
                .addUserOption(option => option.setName('autor').setDescription('The discord user who said the quote.'))
                .addStringOption(option => option.setName('non-discord-autor').setDescription('The person who said the quote.')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('random')
                .setDescription('Get a random quote.')
                .addUserOption(option => option.setName('autor').setDescription('The person who said the quote.'))
                .addStringOption(option => option.setName('non-discord-autor').setDescription('The person who said the quote.'))
                .addStringOption(option => option.setName('text').setDescription('A part of the searched quotes text.')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription('Search quotes by criterias.')
                .addUserOption(option => option.setName('autor').setDescription('The discord user who said the quote.'))
                .addStringOption(option => option.setName('non-discord-autor').setDescription('The person who said the quote.'))
                .addStringOption(option => option.setName('text').setDescription('A part of the searched quotes text.'))),
    /**
     * Executes the quote command
     * @param {Object} interaction - The interaction object
     */
	async execute(interaction) {
        const subcommand = interaction.options.getSubcommand(); 

        switch (subcommand) {
            case 'new': {
                const author = interaction.options.getUser('autor');
                const nonDiscordAuthor = interaction.options.getString('non-discord-autor');
                let authorName;
                let authorId;
                if (author) {
                    authorName = author.username;
                    authorId = author.id;
                }
                else if (nonDiscordAuthor) {
                    authorName = nonDiscordAuthor;
                }

                try {
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
                const author = interaction.options.getUser('autor');
                let authorName;
                let authorId;
                if (author) {
                    authorName = author.username;
                    authorId = author.id;
                }
                else {
                    authorName = interaction.options.getString('non-discord-autor');
                }
                const searchText = interaction.options.getString('text');

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
                    else if (authorName){
                        quotes = quotes.filter(function(value, index, arr){
                            if (value.author == authorName) {
                                return true;
                            }
                            if (authorName.toLowerCase() == 'anonymous' && !value.author) {
                                return true;
                            }
                            return false;
                        });
                        
                        if (quotes.length == 0){
                            interaction.reply({ content: "There is no quote from this author!", ephemeral: true });
                            return;
                        }
                    }

                    if (searchText) {
                        let quoteSimilarities = [];

                        for (const quote of quotes) {
                            let similarity = textSimilarity(searchText.toLowerCase(), quote.quote.toLowerCase());
                            if (similarity > 0.5) {
                                let inserted = false;
                                for (let i = 0; i < quoteSimilarities.length; i++) {
                                    const quote = quoteSimilarities[i];
                                    if (similarity > quote.similarity) {
                                        quoteSimilarities.splice(i, 0, {quote: quote, similarity: similarity});
                                        inserted = true;
                                    }
                                }
                                if (!inserted) {
                                    quoteSimilarities.push({quote: quote, similarity: similarity});
                                }
                            }
                        }

                        quotes = [];
                        for (const quoteSimilarity of quoteSimilarities) {
                            quotes.push(quoteSimilarity.quote);
                        }
                    }

                    if (quotes.length == 0){
                        interaction.reply({ content: "There is no quote on this server!", ephemeral: true });
                        return;
                    }
                    const result = quotes[Math.floor(Math.random()*quotes.length)];
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
                });
                return;
            }
            case 'search': {
                const author = interaction.options.getUser('autor');
                let authorName;
                let authorId;
                if (author) {
                    authorName = author.username;
                    authorId = author.id;
                }
                else {
                    authorName = interaction.options.getString('non-discord-autor');
                }
                const searchText = interaction.options.getString('text');

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
                    else if (authorName){
                        quotes = quotes.filter(function(value, index, arr){
                            if (value.author == authorName) {
                                return true;
                            }
                            if (authorName.toLowerCase() == 'anonymous' && !value.author) {
                                return true;
                            }
                            return false;
                        });
                        
                        if (quotes.length == 0){
                            interaction.reply({ content: "There is no quote from this author!", ephemeral: true });
                            return;
                        }
                    }

                    if (searchText) {
                        let quoteSimilarities = [];

                        for (const quote of quotes) {
                            let similarity = textSimilarity(searchText.toLowerCase(), quote.quote.toLowerCase());
                            if (similarity > 0.5) {
                                let inserted = false;
                                for (let i = 0; i < quoteSimilarities.length; i++) {
                                    if (similarity > quoteSimilarities[i].similarity) {
                                        quoteSimilarities.splice(i, 0, {quote: quote, similarity: similarity});
                                        inserted = true;
                                        break;
                                    }
                                }
                                if (!inserted) {
                                    quoteSimilarities.push({quote: quote, similarity: similarity});
                                }
                            }
                        }

                        quotes = [];
                        for (const quoteSimilarity of quoteSimilarities) {
                            quotes.push(quoteSimilarity.quote);
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
