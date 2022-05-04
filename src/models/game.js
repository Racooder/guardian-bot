// * Imports
const mongoose = require('mongoose');

/**
 * The database schema for a player
 */
const playerSchema = new mongoose.Schema({
    userID: { type: String, required: true },
    language: { type: String, default: 'en' },
});

/**
 * The database model for a player
 */
const model = mongoose.model('PlayerModels', playerSchema);

/**
 * The player schema
 */
module.exports = model;
