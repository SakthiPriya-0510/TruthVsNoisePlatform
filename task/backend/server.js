
require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);


mongoose
    .connect("mongodb://127.0.0.1:27017/truthvsnoise")
    .then(() => console.log("MongoDB Connected"));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
const claimRoutes = require("./routes/claimRoutes");
const credibilityRoutes = require("./routes/credibilityRoutes");

app.use("/api/claims", claimRoutes);
app.use("/api/credibility", credibilityRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
