const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const User = require("../models/User");

// Fetch all users (excluding the current user)
router.get("/api/users/:id", async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select("userName _id");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Fetch chat history between two users
router.get("/api/users/:user1/:user2", async (req, res) => {
  try {
    const messages = await Chat.find({
      $or: [
        { senderId: req.params.user1, receiverId: req.params.user2 },
        { senderId: req.params.user2, receiverId: req.params.user1 },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching chat history" });
  }
});

// Save a new chat message
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;
    const newMessage = new Chat({ senderId, receiverId, message });
    await newMessage.save();
    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Error sending message" });
  }
});

module.exports = router;
