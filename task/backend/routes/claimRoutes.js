const express = require("express");
const Claim = require("../models/Claim");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================
   CREATE CLAIM
========================= */
router.post("/", protect, async (req, res) => {
  const { domain, statement } = req.body;

  try {
    const claim = await Claim.create({
      user: req.user.id,
      domain,
      statement,
      votes: [], // important: always array
    });

    const populatedClaim = await Claim.findById(claim._id)
      .populate("user", "name")
      .lean();

    res.status(201).json({
      _id: populatedClaim._id,
      domain: populatedClaim.domain,
      statement: populatedClaim.statement,
      userName: populatedClaim.user?.name || "Unknown",
      votesCount: { agree: 0, disagree: 0 },
      voters: [],
    });
  } catch (err) {
    console.error("Create claim error:", err);
    res.status(500).json({ message: "Failed to create claim" });
  }
});

/* =========================
   GET CLAIM BY ID WITH DETAILED VOTER INFO
========================= */
router.get("/:id", protect, async (req, res) => {
  try {
    console.log("Fetching claim with ID:", req.params.id);
    const claim = await Claim.findById(req.params.id)
      .populate("user", "name")
      .populate("votes.user", "name email credibilityScore");
    
    console.log("Found claim:", claim);

    if (!claim) {
      console.log("Claim not found");
      return res.status(404).json({ message: "Claim not found" });
    }

    // Format the response with detailed voter information
    const formattedClaim = {
      _id: claim._id,
      domain: claim.domain,
      statement: claim.statement,
      user: claim.user,
      votes: claim.votes.map(vote => ({
        user: vote.user,
        type: vote.type,
        createdAt: vote.createdAt
      })),
      createdAt: claim.createdAt
    };
    
    console.log("Formatted claim:", formattedClaim);

    res.json(formattedClaim);
  } catch (err) {
    console.error("Fetch claim detail error:", err);
    res.status(500).json({ message: "Failed to fetch claim details" });
  }
});

/* =========================
   GET ALL CLAIMS
========================= */
router.get("/", protect, async (req, res) => {
  try {
    const claims = await Claim.find()
      .sort({ createdAt: -1 })
      .populate("user", "name")
      .lean();

    const formattedClaims = claims.map((c) => {
      const votesCount = { agree: 0, disagree: 0 };

      if (Array.isArray(c.votes)) {
        c.votes.forEach((v) => {
          if (v.type === "agree") votesCount.agree++;
          if (v.type === "disagree") votesCount.disagree++;
        });
      }

      return {
        _id: c._id,
        domain: c.domain,
        statement: c.statement,
        userName: c.user?.name || "Unknown",
        votesCount,
        voters: Array.isArray(c.votes)
          ? c.votes.map((v) => v.user.toString())
          : [],
      };
    });

    res.json(formattedClaims);
  } catch (err) {
    console.error("Fetch claims error:", err);
    res.status(500).json({ message: "Failed to fetch claims" });
  }
});

/* =========================
   VOTE ON CLAIM
========================= */
router.post("/:id/vote", protect, async (req, res) => {
  const { vote } = req.body; // "agree" | "disagree"

  try {
    if (!["agree", "disagree"].includes(vote)) {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    // Ensure votes is array (for old data safety)
    if (!Array.isArray(claim.votes)) {
      claim.votes = [];
    }

    // Prevent double voting
    const alreadyVoted = claim.votes.find(
      (v) => v.user.toString() === req.user.id.toString()
    );

    if (alreadyVoted) {
      return res.status(400).json({ message: "You already voted" });
    }

    // Add vote
    claim.votes.push({
      user: req.user.id,
      type: vote,
      createdAt: new Date()
    });

    await claim.save();

    // Calculate counts
    const votesCount = { agree: 0, disagree: 0 };
    claim.votes.forEach((v) => {
      if (v.type === "agree") votesCount.agree++;
      if (v.type === "disagree") votesCount.disagree++;
    });

    const updatedClaim = await Claim.findById(claim._id)
      .populate("user", "name")
      .lean();

    res.json({
      _id: updatedClaim._id,
      domain: updatedClaim.domain,
      statement: updatedClaim.statement,
      userName: updatedClaim.user?.name || "Unknown",
      votesCount,
      voters: updatedClaim.votes.map((v) => v.user.toString()),
    });
  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).json({ message: "Failed to vote" });
  }
});

module.exports = router;
