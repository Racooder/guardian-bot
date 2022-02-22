// * Imports
const mongoose = require('mongoose');

/**
 * The database schema for a guild
 */
const guildSchema = new mongoose.Schema({
    serverID: { type: String, required: true },
    author: { type: String },
    quote: { type: String }
});

/**
 * The database model for a guild
 */
const model = mongoose.model('GuildModels', guildSchema);

/**
 * The profile schema
 */
module.exports = model;