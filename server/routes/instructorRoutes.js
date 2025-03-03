const express = require("express");
const multer = require("multer");

const InstructorPersonalTraining = require("../models/InstructorPersonalTraining");
const { uploadInstructorProfileToCloudinary } = require("../helpers/cloudinary");

const router = express.Router();
router.use(express.json());

// Storage setup (using memory storage as in your code)
const storage = multer.memoryStorage(); // You can switch to diskStorage if needed

// File filter to ensure only image/video files are accepted
const fileFilter = (req, file, cb) => {
    console.log("File received:", file);  // Log the entire file object for debugging
    if (file.mimetype && (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/'))) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Invalid file type'), false); // Reject the file
    }
  };
  

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Max file size (e.g., 10MB limit)
  }
}).fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'introVideo', maxCount: 1 }
]);

// Handle instructor intro saving
router.post("/intro/save", upload, async (req, res) => {
  try {
    // Log the received form data and files to debug
    console.log("📥 Received Form Data:", req.body);
    console.log("📁 Received Files:", req.files);  // Log the received files here

    let { instructorId, name, introduction, availableSlots } = req.body;
    let profilePhoto = req.files.profilePhoto ? req.files.profilePhoto[0].buffer : null;
    let introVideo = req.files.introVideo ? req.files.introVideo[0].buffer : null;

    if (!instructorId || !name || !introduction) {
      console.error("❌ Missing required fields:", { instructorId, name, introduction });
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // ✅ Upload profile photo to Cloudinary
    if (profilePhoto) {
      const uploadResponse = await uploadInstructorProfileToCloudinary(profilePhoto, "image");
      profilePhoto = uploadResponse.secure_url;
    }

    // ✅ Upload intro video to Cloudinary
    if (introVideo) {
      const uploadResponse = await uploadInstructorProfileToCloudinary(introVideo, "video");
      introVideo = uploadResponse.secure_url;
    }

    let instructor = await InstructorPersonalTraining.findOne({ instructorId });

    if (instructor) {
      console.log("📝 Updating instructor details");
      instructor.name = name;
      instructor.profilePhoto = profilePhoto || instructor.profilePhoto;
      instructor.introVideo = introVideo || instructor.introVideo;
      instructor.introduction = introduction;
      instructor.availableSlots = availableSlots;
      await instructor.save();
    } else {
      console.log("➕ Creating new instructor entry");
      instructor = new InstructorPersonalTraining({
        instructorId,
        name,
        profilePhoto,
        introVideo,
        introduction,
        availableSlots,
      });
      await instructor.save();
    }

    console.log("✅ Instructor details saved:", instructor);
    res.status(200).json({ success: true, message: "Instructor details saved successfully", data: instructor });
  } catch (error) {
    console.error("❌ Error saving instructor intro:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/intro/all", async (req, res) => {
    try {
        const instructors = await InstructorPersonalTraining.find({}, "-__v -createdAt -updatedAt");
        res.status(200).json({ success: true, data: instructors });
    } catch (error) {
        console.error("❌ Error fetching instructors:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
