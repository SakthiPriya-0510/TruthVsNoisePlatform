// routes/credibilityRoutes.js
const express = require("express");
const Credibility = require("../models/Credibility");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware"); // new middleware for admin access

const router = express.Router();

// Submit credibility request (user-side)
router.post("/", protect, async(req, res) => {
    const { knowledgeDomain, linkedin } = req.body;
    try {
        const cred = await Credibility.create({
            user: req.user.id,
            knowledgeDomain,
            linkedin,
        });
        res.status(201).json(cred);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to submit credibility" });
    }
});

// Get all credibility requests (admin-side)
router.get("/", protect, admin, async(req, res) => {
    try {
        const requests = await Credibility.find({ verified: false })
            .populate("user", "name email credibilityScore")
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch credibility requests" });
    }
});

// Verify a credibility request (admin-side)
router.post("/:id/verify", protect, admin, async(req, res) => {
    try {
        console.log("Starting credibility verification for request:", req.params.id);
        const request = await Credibility.findById(req.params.id).populate("user");
        console.log("Found request:", !!request);
        if (!request) {
            console.log("Request not found");
            return res.status(404).json({ message: "Request not found" });
        }

        console.log("Request user:", request.user.name, request.user.email);

        // Define the domain mapping
        const domains = [
            "Environment & Climate",
            "Entertainment & Celebrities",
            "Law, Rights & Ethics",
            "Business & Economy",
            "News & Media",
            "Politics & Government",
            "Health & Medicine",
            "Science & Technology"
        ];

        // Find the index of the domain
        const domainIndex = domains.indexOf(request.knowledgeDomain);
        console.log("Domain index:", domainIndex);

        if (domainIndex === -1) {
            console.log("Invalid domain");
            return res.status(400).json({ message: "Invalid domain" });
        }

        request.verified = true;
        await request.save();
        console.log("Request saved as verified");

        // Initialize credibilityScore array if it doesn't exist
        if (!request.user.credibilityScore || !Array.isArray(request.user.credibilityScore)) {
            request.user.credibilityScore = [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3];
        }

        // Increment user's credibility score for the specific domain (example: +0.2 points)
        const oldScore = request.user.credibilityScore[domainIndex];
        request.user.credibilityScore[domainIndex] = (request.user.credibilityScore[domainIndex] || 0.3) + 0.2;
        console.log(`Updating score for domain ${request.knowledgeDomain} from ${oldScore} to ${request.user.credibilityScore[domainIndex]}`);

        if (request.user.credibilityScore[domainIndex] > 1) {
            request.user.credibilityScore[domainIndex] = 1;
        }

        const saveResult = await request.user.save();
        console.log("User saved with new score:", saveResult.credibilityScore);

        // Verify the update was actually saved
        const updatedUser = await User.findById(request.user._id);
        console.log("User score in database after save:", updatedUser.credibilityScore);

        res.json({
            message: "Credibility verified",
            user: request.user,
            credibilityScore: request.user.credibilityScore,
            debug: {
                oldScore: oldScore,
                newScore: request.user.credibilityScore[domainIndex],
                dbScore: updatedUser.credibilityScore[domainIndex],
                domain: request.knowledgeDomain,
                domainIndex: domainIndex
            }
        });
    } catch (err) {
        console.error("Error in verification:", err);
        res.status(500).json({ message: "Failed to verify credibility", error: err.message });
    }
});

module.exports = router;