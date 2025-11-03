const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    language: { type: String, required: true },
    tags: { type: [String], default: [] },
    code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now } // date created
});

module.exports = mongoose.model("snippet",snippetSchema);