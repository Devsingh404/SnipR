const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Snippet = require("../models/snippet");

//to get all the snippets from db
router.get("/", async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ message: "Missing userId" });
        }
        const snippets = await Snippet.find({ userId }).sort({ createdAt: -1 });
        res.json(snippets);
    } catch (err) {
        console.error("Error fetching snippets:", err);
        res.status(500).json({ message: "Server Error" });
    }
})


// Create a new snippet for logged-in user
router.post("/", async (req, res) => {
    try {
        const { title, language, code, tags, userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "Missing userId" });
        }

        const tagsArray = tags ? tags.split(",").map(tag => tag.trim()) : [];

        const newSnippet = new Snippet({
            title,
            language,
            code,
            tags: tagsArray,
            userId
        });
        await newSnippet.save();
        res.status(201).json({ message: "Snippet created successfully" });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Invalid data" });
    }
});

// Update a snippet (only if it belongs to user)
router.put("/:id", async (req, res) => {
    try {
        const { userId, title, language, code, tags } = req.body;


        const snippet = await Snippet.findOne({ _id: req.params.id, userId });
        if (!snippet) return res.status(404).json({ message: "Snippet not found" });

        snippet.title = title || snippet.title;
        snippet.language = language || snippet.language;
        snippet.code = code || snippet.code;
        snippet.tags = tags ? tags.split(",").map(tag => tag.trim()) : snippet.tags;

        await snippet.save();
        res.json({ message: "Snippet updated successfully" });
    } catch (err) {
        console.error("Error updating snippet:", err);
        res.status(400).json({ error: "Invalid data" });
    }
});

// Delete a snippet (only if it belongs to user)

router.delete("/:id", async (req, res) => {
    try {
        const snippetId = req.params.id; // string is fine
        const userId = req.query.userId; // string is fine

        console.log("Backend DELETE hit", snippetId, userId);

        const snippet = await Snippet.findOneAndDelete({
            _id: snippetId,   // string works
            userId: userId    // string works
        });

        if (!snippet) return res.status(404).json({ message: "Snippet not found" });

        res.json({ message: "Snippet deleted successfully" });
    } catch (err) {
        console.error("Error in DELETE:", err);
        res.status(500).json({ error: "Server Error" });
    }
});




module.exports = router;