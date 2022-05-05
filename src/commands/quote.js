const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Interaction, GuildMember } = require('discord.js');
const quoteModel = require('../models/quote');
const textSimilarity = require('../textSimilarity');
const log = require('../log.js');

/**
 * Executes a quote command
 * - quote new `<quote>` `<author?>` `<non-discord-author?>` - Creates a new quote
 * - quote random `<author?>` `<non-discord-author?>` `<text?>` - Gets a random quote mathing the given criteria
 * - quote search `<author?>` `<non-discord-author?>` `<text?>` - Searches for quotes matching the criteria
 */
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
                .addUserOption(option => option.setName('author').setDescription('The discord user who said the quote.'))
                .addStringOption(option => option.setName('non-discord-author').setDescription('The person who said the quote.')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('random')
                .setDescription('Get a random quote.')
                .addUserOption(option => option.setName('author').setDescription('The person who said the quote.'))
                .addStringOption(option => option.setName('non-discord-author').setDescription('The person who said the quote.'))
                .addStringOption(option => option.setName('text').setDescription('A part of the searched quotes text.')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription('Search quotes by criterias.')
                .addUserOption(option => option.setName('author').setDescription('The discord user who said the quote.'))
                .addStringOption(option => option.setName('non-discord-author').setDescription('The person who said the quote.'))
                .addStringOption(option => option.setName('text').setDescription('A part of the searched quotes text.'))),
    /**
     * Executes the quote command
     * @param {Interaction} interaction - The interaction object
     */
	async execute(interaction) {
        const subcommand = interaction.options.getSubcommand(); 
        const author = interaction.options.getUser('author');
        const nonDiscordAuthor = interaction.options.getString('non-discord-author');
        const guildId = interaction.member.guild.id;
        let authorName;
        let authorId;
        let message;
        if (author) {
            authorName = author.username;
            authorId = author.id;
        }
        else if (nonDiscordAuthor) {
            authorName = nonDiscordAuthor;
        }
        
        switch (subcommand) {
            case 'new': {
                const quote = interaction.options.getString('quote');
                const creator = interaction.member.username;
                const creatorId = interaction.member.id;
                message = await createQuote(guildId, authorName, authorId, quote, creator, creatorId);
                break;
            }
            case 'random': {
                const searchText = interaction.options.getString('text');
                const guildMembers = interaction.member.guild.members;
                message = await randomQuote(guildMembers, guildId, authorName, authorId, searchText);
                break;
            }
            case 'search': {
                const searchText = interaction.options.getString('text');
                const guildMembers = interaction.member.guild.members;
                message = await searchQuote(guildMembers, guildId, authorName, authorId, searchText);
                break;
            }
            default: {
                message = { content: "Inexisting subcommand of the quote command!" };
                break;
            }
        }
        
        await interaction.reply({ content: message.content, embeds: message.embeds, components: message.components, ephemeral: message.ephemeral });
	},
};

/**
 * Creates a new quote
 * @param {String} guildId - The guild id
 * @param {String} authorName - The author name
 * @param {String} authorId - The author id
 * @param {String} quote - The quote text
 * @param {String} creator - The creator name
 * @param {String} creatorId - The creator id
 * @returns {Object} The message object
 */
async function createQuote(guildId, authorName, authorId, quote, creator, creatorId) 
{
    let profile = await quoteModel.create({
        serverID: guildId,
        author: authorName,
        authorId: authorId,
        quote: quote,
        timestamp: parseInt(Date.now() / 1000),
        creator: creator,
        creatorId: creatorId
    });
    profile.save();
    const message = { content: "Sucessfully saved the quote!", ephemeral: true }
    return message;
}

/**
 * Gets a random quote
 * @param {GuildMember[]} guildMembers - The guild members
 * @param {String} guildId - The guild id
 * @param {String} authorName - The author name
 * @param {String} authorId - The author id
 * @param {String} searchText - The search text
 * @returns {Object} The message object
 */
async function randomQuote(guildMembers, guildId, authorName, authorId, searchText)
{
    const quotes = await getQuotes(guildId, authorName, authorId, searchText);

    if (quotes.length == 0){
        const message = { content: "There are no quotes in this server following the given criteria!", ephemeral: true }
        return message;
    }

    const result = quotes[Math.floor(Math.random()*quotes.length)];
    let authorText;
    if (result.authorId && guildMembers.cache.find(user => user.id == result.authorId))
    {
        authorText = await guildMembers.fetch(result.authorId);
        authorText = authorText.displayName;
    }
    else
    {
        authorText = result.author ? result.author : 'anonymous';
    }

    const quoteText = result.quote.quote ? result.quote.quote : result.quote; // The fastest solution. Maybe fix this later.
    const quoteTimestamp = result.timestamp;

    const embed = new MessageEmbed()
        .setTitle(`"${quoteText}" - ${authorText}`)
    if (result.timestamp) {
        embed.setDescription(`Created at <t:${quoteTimestamp}:d>`);
    }
    
    const message = { embeds: [embed] };
    return message;
}

/**
 * Searches for quotes
 * @param {GuildMember[]} guildMembers - The guild members
 * @param {String} guildId - The guild id
 * @param {String} authorName - The author name
 * @param {String} authorId - The author id
 * @param {String} searchText - The search text
 * @returns {Object} The message object
 */
async function searchQuote(guildMembers, guildId, authorName, authorId, searchText)
{
    const quotes = await getQuotes(guildId, authorName, authorId, searchText);

    if (quotes.length == 0){
        const message = { content: "There are no quotes in this server following the given criteria!", ephemeral: true }
        return message;
    }

    const embed = new MessageEmbed().setTitle("Your searched quotes");

    for (const quote of quotes) {
        let authorText;
        if (guildMembers.cache.find(user => user.id == quote.authorId))
        {
            authorText = await guildMembers.fetch(quote.authorId);
            authorText = authorText.displayName;
        }
        else
        {
            authorText = quote.author ? quote.author : 'anonymous';
        }

        const quoteText = quote.quote;
        const quoteTimestamp = quote.timestamp;

        embed.addField(`"${quoteText}" - ${authorText}`, quoteTimestamp ? `Created at <t:${quoteTimestamp}:d>` : "Unknown creation date");
    }
    
    const message = { embeds: [embed] }
    return message;
}

/**
 * Gets all the quotes from the database following the given criteria
 * @param {String} guildId - The guild id
 * @param {String} authorName - The author name
 * @param {String} authorId - The author id
 * @param {String} searchText - The search text
 * @returns {Object[]} The gotten quotes
 */
async function getQuotes(guildId, authorName, authorId, searchText)
{
    let quotes = await quoteModel.find({ serverID: guildId }, async function(err, quotes) 
    {
        return quotes;
    }).clone().catch(function(err){ log.error(err)});

    if (authorName || authorId) {
        quotes = filterByAuthor(quotes, authorName, authorId);
    }

    if (searchText) {
        quotes = filterByText(quotes, searchText);
    }

    return quotes;
}

/**
 * Filters quotes by author
 * @param {Object[]} quotes - The quotes
 * @param {String} authorName - The author name
 * @param {String} authorId - The author id
 * @returns {Object[]} The filtered quotes
 */
function filterByAuthor(quotes, authorName, authorId) 
{
    if (authorId) {
        const newQuotes = quotes.filter(function(value, index, arr){
            return value.authorId == authorId;
        });
        return newQuotes;
    }
    else if (authorName){
        const newQuotes = quotes.filter(function(value, index, arr){
            return value.author == authorName;
        });
        return newQuotes;
    }

    return quotes;
}

/**
 * Filters quotes by text
 * @param {Object[]} quotes - The quotes
 * @param {String} searchText - The search text 
 * @returns {Object[]} The filtered quotes
 */
function filterByText(quotes, searchText) 
{
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

    return quotes;
}
