require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(express.json());

// Update CORS to be conditional for production
const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
};
app.use(cors(corsOptions));


mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
const claimRoutes = require("./routes/claimRoutes");
const credibilityRoutes = require("./routes/credibilityRoutes");

app.use("/api/claims", claimRoutes);
app.use("/api/credibility", credibilityRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));