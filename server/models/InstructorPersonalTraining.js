const mongoose = require("mongoose");

const InstructorPersonalTrainingSchema = new mongoose.Schema({
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  profilePhoto: { type: String, required: true },
  introVideo: { type: String },
  introduction: { type: String, required: true },
  availableSlots: [{ type: String }], // Example: ["2025-03-05 10:00 AM", "2025-03-06 3:00 PM"]
}, { timestamps: true });

module.exports = mongoose.model("InstructorPersonalTraining", InstructorPersonalTrainingSchema);
