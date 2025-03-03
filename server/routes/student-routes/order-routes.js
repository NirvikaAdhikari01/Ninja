const express = require("express");
const {
  createOrder,
  capturePaymentAndFinalizeOrder,
  initiateKhaltiPayment,
} = require("../../controllers/student-controller/order-controller");
const { processKhaltiPayment } = require("../../controllers/student-controller/khalti-payment-controller");
const router = express.Router();

router.post("/create", createOrder);
router.post("/capture", capturePaymentAndFinalizeOrder);
router.post("/khalti-return", processKhaltiPayment);
router.post("/initiate-khalti", initiateKhaltiPayment);
module.exports = router;
