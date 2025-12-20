const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    domain: {
      type: String,
      required: true,
    },

    statement: {
      type: String,
      required: true,
    },

    votes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: { type: String, enum: ["agree", "disagree"] },
        createdAt: { type: Date, default: Date.now }
      }
    ]

  },
  { timestamps: true }
);

module.exports = mongoose.model("Claim", claimSchema);
