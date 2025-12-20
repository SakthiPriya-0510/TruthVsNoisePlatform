// models/Credibility.js
const mongoose = require("mongoose");

const credibilitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    knowledgeDomain: { type: String, required: true },
    linkedin: { type: String, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Credibility", credibilitySchema);
