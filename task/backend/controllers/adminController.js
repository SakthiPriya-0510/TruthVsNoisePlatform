const User = require("../models/User");


// ===============================
// GET USERS PENDING VERIFICATION
// ===============================
exports.getPendingUsers = async(req, res) => {
    try {
        const users = await User.find({
            linkedin: { $ne: null },
            linkedinVerified: false
        }).select("name email domains linkedin credibilityScore");

        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ===============================
// VERIFY USER & INCREASE CREDIBILITY
// ===============================
exports.verifyUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.linkedinVerified) {
            return res.status(400).json({ message: "Already verified" });
        }

        user.linkedinVerified = true;
        user.credibilityScore += 0.2;

        if (user.credibilityScore > 1) {
            user.credibilityScore = 1;
        }

        await user.save();

        res.json({
            message: "User verified successfully",
            credibilityScore: user.credibilityScore
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ===============================
// REJECT USER
// ===============================
exports.rejectUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.linkedin = null;
        user.linkedinVerified = false;

        await user.save();

        res.json({ message: "Verification rejected" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};