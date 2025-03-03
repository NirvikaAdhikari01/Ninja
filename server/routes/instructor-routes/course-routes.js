const express = require("express");
const {
  addNewCourse,
  getAllCourses,
  getInstructorCourses, // New function to fetch courses by instructorId
  getCourseDetailsByID,
  updateCourseByID,
} = require("../../controllers/instructor-controller/course-controller");

const router = express.Router();

router.post("/add", addNewCourse);
router.get("/get", getAllCourses); // Fetch all courses (Admin/public)
router.get("/get/instructor/:instructorId", getInstructorCourses); // Fetch courses for a specific instructor
router.get("/get/details/:id", getCourseDetailsByID);
router.put("/update/:id", updateCourseByID);

module.exports = router;
