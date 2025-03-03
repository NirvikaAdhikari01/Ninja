const Course = require("../../models/Course");

// Add a new course
const addNewCourse = async (req, res) => {
  try {
    const courseData = req.body;

    if (!courseData.instructorId) {
      return res.status(400).json({
        success: false,
        message: "Instructor ID is required",
      });
    }

    const newlyCreatedCourse = new Course(courseData);
    const saveCourse = await newlyCreatedCourse.save();

    res.status(201).json({
      success: true,
      message: "Course saved successfully",
      data: saveCourse,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "An error occurred while saving the course",
    });
  }
};

// Get all courses (for admin or public viewing)
const getAllCourses = async (req, res) => {
  try {
    const coursesList = await Course.find({});
    res.status(200).json({
      success: true,
      data: coursesList,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching courses",
    });
  }
};

// Get courses specific to an instructor
const getInstructorCourses = async (req, res) => {
  try {
    const { instructorId } = req.params;

    if (!instructorId) {
      return res.status(400).json({
        success: false,
        message: "Instructor ID is required",
      });
    }

    // Fetch courses where instructorId matches the given instructorId
    const courses = await Course.find({ instructorId });

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching instructor courses",
    });
  }
};


// Get course details by ID
const getCourseDetailsByID = async (req, res) => {
  try {
    const { id } = req.params;
    const courseDetails = await Course.findById(id);

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: courseDetails,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching course details",
    });
  }
};

// Update course by ID
const updateCourseByID = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCourseData = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(id, updatedCourseData, {
      new: true,
    });

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the course",
    });
  }
};

module.exports = {
  addNewCourse,
  getAllCourses,
  getInstructorCourses, // Added this new function
  getCourseDetailsByID,
  updateCourseByID,
};
