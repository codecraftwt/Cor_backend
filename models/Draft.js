const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    type: { type: String, enum: ['Press Release', 'Blog'], required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Draft', draftSchema); 