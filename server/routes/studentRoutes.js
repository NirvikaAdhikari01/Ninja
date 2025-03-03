const express = require("express");
const InstructorPersonalTraining = require("../models/InstructorPersonalTraining");
const router = express.Router();

// ✅ Get all instructors available for personal training
router.get("/personal-training-instructors", async (req, res) => {
    try {
        const instructors = await InstructorPersonalTraining.find();
        res.json(instructors);
    } catch (error) {
        res.status(500).json({ message: "Error fetching instructors.", error });
    }
});

module.exports = router;
