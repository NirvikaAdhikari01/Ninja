const express = require("express");
const BookedSession = require("../models/BookedSessions");
const InstructorPersonalTraining = require("../models/InstructorPersonalTraining");
const router = express.Router();

// Dummy function to generate Zoom link
const generateZoomLink = () => {
    return `https://zoom.us/j/${Math.floor(1000000000 + Math.random() * 9000000000)}`;
};

// ✅ Book a session
router.post("/book-session", async (req, res) => {
    try {
        const { studentId, instructorId, slot } = req.body;

        // Ensure slot is still available
        const instructor = await InstructorPersonalTraining.findOne({ instructorId });
        if (!instructor) {
            return res.status(404).json({ message: "Instructor not found." });
        }
        if (!instructor.availableSlots.includes(slot)) {
            return res.status(400).json({ message: "Slot unavailable." });
        }

        // Generate Zoom link
        const zoomLink = generateZoomLink();

        // Save booking
        const newSession = new BookedSession({ studentId, instructorId, slot, zoomLink });
        await newSession.save();

        // Remove booked slot
        instructor.availableSlots = instructor.availableSlots.filter(s => s !== slot);
        await instructor.save();

        // Simulate chat message to student & instructor
        const chatMessage = `Your session is confirmed! Join via Zoom: ${zoomLink} at ${slot}`;
        console.log(`Message sent to student ${studentId}: ${chatMessage}`);
        console.log(`Message sent to instructor ${instructorId}: ${chatMessage}`);

        res.status(201).json({ message: "Session booked.", zoomLink });
    } catch (error) {
        res.status(500).json({ message: "Error booking session.", error });
    }
});

module.exports = router;
