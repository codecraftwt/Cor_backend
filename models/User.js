const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String },
    company: { type: String },
    location: { type: [String], required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String },
    websites: { type: [String] },
    industries: { type: [String] },
    products: { type: [String] },
    onboardingProgress: { type: Number, default: 0 },
    googleId: { type: String },
    photoURL: { type: String }
});

module.exports = mongoose.model('User', userSchema);
