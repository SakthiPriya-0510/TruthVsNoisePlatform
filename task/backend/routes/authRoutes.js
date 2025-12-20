const sendEmail = require("../utils/sendEmail");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ===============================
// SEND OTP
// ===============================
router.post("/send-otp", async(req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Name and email required" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const lowerEmail = email.toLowerCase();

        let user = await User.findOne({ email: lowerEmail });

        if (!user) {
            user = await User.create({
                name,
                email: lowerEmail,
                otp,
                verified: false
            });
        } else {
            user.otp = otp;
            await user.save();
        }

        await sendEmail(lowerEmail, otp);

        res.json({ message: "OTP sent successfully", userId: user._id });

    } catch (err) {
        console.error("EMAIL ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});


// ===============================
// VERIFY OTP & SET PASSWORD
// ===============================
router.post("/verify", async(req, res) => {
    try {
        const { userId, otp, password } = req.body;

        const user = await User.findById(userId);

        if (!user || user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.verified = true;
        user.otp = null;

        await user.save();

        res.json({ message: "Account verified successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ===============================
// LOGIN USER ✅ (NEW)
// ===============================
router.post("/login", async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (!user.verified) {
            return res.status(403).json({ message: "Please verify your account" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ id: user._id },
            process.env.JWT_SECRET || "secretkey", { expiresIn: "1d" }
        );
        console.log("USER FROM DB:", user);
        console.log("USER ROLE FROM DB:", user.role);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ===============================
// GET USER INFO
// ===============================
router.get("/me", protect, async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ===============================
// SAVE PREFERENCES
// ===============================
router.post("/preferences", async(req, res) => {
    try {
        const { userId, domains, linkedin } = req.body;

        await User.findByIdAndUpdate(userId, {
            domains,
            linkedin,
            linkedinVerified: false
        });

        res.json({ message: "Preferences saved, pending admin verification" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;