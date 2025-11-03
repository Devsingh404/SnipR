const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

const PORT = process.env.PORT || 5000;

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());

// ---------- ROUTES ----------
const authRoutes = require("./routes/authRoutes");
const snippetRoutes = require("./routes/snippetRoutes");

app.use("/auth", authRoutes);
app.use("/snippets", snippetRoutes);

// Serve all frontend files (HTML, CSS, JS) from /frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Serve login page (optional: can be accessed as /login.html directly)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../login.html"));
});

// ---------- DATABASE + SERVER ----------
mongoose.connect(process.env.MONGO_URI, {})
    .then(() => {
        console.log("✅ Connected to MongoDB");
        app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
    })
    .catch(err => console.error("❌ MongoDB connection error:", err));
