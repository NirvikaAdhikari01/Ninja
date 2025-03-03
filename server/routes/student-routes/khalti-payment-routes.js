const express = require("express");
const { processKhaltiPayment } = require("../../controllers/student-controller/khalti-payment-controller");

const router = express.Router();

router.post("/", processKhaltiPayment); // ✅ Handle Khalti payment response

module.exports = router;
