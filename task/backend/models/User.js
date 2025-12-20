const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,

    email: {
        type: String,
        unique: true,
        required: true
    },

    password: String,

    verified: {
        type: Boolean,
        default: false
    },

    otp: String,

    domains: [String],

    linkedin: String,

    linkedinVerified: {
        type: Boolean,
        default: false
    },

    credibilityScore: {
        type: [Number],
        default: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3]
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
});

module.exports = mongoose.model("User", userSchema);