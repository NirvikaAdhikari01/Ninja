const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, unique: true, trim: true },
    userEmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Ensures valid email format
    },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["user", "instructor"] },
    esewaNumber: { type: String, required: function () { return this.role === "instructor"; } } // Required only if role is instructor
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
