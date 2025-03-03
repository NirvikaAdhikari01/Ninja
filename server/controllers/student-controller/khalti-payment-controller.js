const axios = require("axios");

const khaltiSecretKey = "f251ac61c4134b5b91f1374c11154259"; 

// Step 1: Initiate Payment
const initiateKhaltiPayment = async (req, res) => {
  try {
      const { userId, courseId, amount, customerName } = req.body;

      if (!userId || !courseId || !amount || !customerName) {
          return res.status(400).json({ success: false, message: "Invalid request. Missing required fields." });
      }

      // Convert amount to paisa (amount in rupees * 100)
      const amountInPaisa = amount * 100;

      // Prepare the payload with the amount in paisa
      const payload = {
          return_url: "http://localhost:5173/khalti-return",  // Redirect after payment
          website_url: "http://localhost:5173",
          amount: amountInPaisa,  // Amount in paisa (9000 = 90.00)
          purchase_order_id: courseId,  // Unique course ID or order ID
          purchase_order_name: `Payment for Course ${courseId}`,  // Custom order name
          customer_info: { name: customerName },  // Customer's full name
      };

      console.log("Sending Payload:", payload);  // Log the payload for debugging

      const response = await axios.post(
          "https://a.khalti.com/api/v2/epayment/initiate/",
          payload,
          { headers: { Authorization: `Key ${khaltiSecretKey}` } }
      );

      if (response.data.payment_url) {
          return res.status(200).json({ success: true, payment_url: response.data.payment_url });
      } else {
          return res.status(400).json({ success: false, message: "Failed to initiate payment" });
      }

  } catch (error) {
      console.error("Khalti Payment Initiation Error:", error?.response?.data || error);
      return res.status(500).json({ success: false, message: "Khalti payment initiation failed" });
  }
};




const processKhaltiPayment = async (req, res) => {
  try {
      const { pidx } = req.body;

      if (!pidx) {
          return res.status(400).json({ success: false, message: "Invalid request" });
      }

      const verifyUrl = `https://a.khalti.com/api/v2/epayment/lookup/`;

      const response = await axios.post(
          verifyUrl,
          { pidx },
          { headers: { Authorization: `Key ${khaltiSecretKey}` } }
      );

      console.log("Khalti Verification Response:", response.data);

      if (response.data.status === "Completed") {
          return res.status(200).json({
              success: true,
              message: "Payment verified successfully",
              data: response.data,
          });
      } else {
          return res.status(400).json({ success: false, message: "Payment verification failed" });
      }

  } catch (error) {
      console.error("Khalti Payment Verification Error:", error.response?.data || error);
      return res.status(500).json({ success: false, message: "Khalti payment verification failed" });
  }
};

module.exports = { initiateKhaltiPayment, processKhaltiPayment };
