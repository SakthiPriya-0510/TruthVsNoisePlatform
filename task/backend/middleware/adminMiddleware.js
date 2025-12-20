// middleware/adminMiddleware.js
const User = require("../models/User");

const admin = async(req, res, next) => {
    try {
        // Fetch the full user document to check role
        const user = await User.findById(req.user.id);
        if (user && user.role === "admin") {
            next();
        } else {
            res.status(403).json({ message: "Admin access required" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = admin;