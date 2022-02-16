const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
    serverID: { type: String, required: true },
    author: { type: String },
    quote: { type: String }
});

const model = mongoose.model('GuildModels', guildSchema);

module.exports = model;