const instructorService = require("../services/instructorService");

const optInForTraining = async (req, res) => {
    try {
        const trainingDetails = await instructorService.optInForPersonalTraining(req.body);
        res.status(201).json({ message: "Instructor added to personal training.", trainingDetails });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAllPersonalTrainingInstructors = async (req, res) => {
    try {
        const instructors = await instructorService.getPersonalTrainingInstructors();
        res.json(instructors);
    } catch (error) {
        res.status(500).json({ message: "Error fetching instructors.", error });
    }
};

module.exports = {
    optInForTraining,
    getAllPersonalTrainingInstructors,
};
