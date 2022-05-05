// * Imports
const { Schema, model } = require('mongoose');

/**
 * The database schema for a quote
 */
const quoteSchema = new Schema({
    serverID: { type: String, required: true },
    author: { type: String },
    authorId: { type: String },
    quote: { type: String },
    timestamp: { type: Number },
    creator: { type: String },
    creatorId: { type: String }
});

/**
 * The database model for a quote
 */
const quoteModel = model('QuoteModels', quoteSchema);

/**
 * The quote schema
 */
module.exports = quoteModel;
