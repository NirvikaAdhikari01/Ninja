const axios = require("axios");

// ✅ Use TEST keys for Sandbox environment
const KHALTI_SECRET_KEY = "f251ac61c4134b5b91f1374c11154259"; 
const KHALTI_PUBLIC_KEY = "51c70a2b94284976a81b2ba1aaf63c4e"; 

const khaltiConfig = {
  baseURL: "https://sandbox.khalti.com/api/v2/payment"
};

// Function to initiate Khalti payment
const createPayment = async (amount, purchaseOrderId) => {
  try {
    const response = await axios.post(
      `${khaltiConfig.baseURL}/initiate/`,
      {
        public_key: KHALTI_PUBLIC_KEY,  // ✅ Must include public key for sandbox
        return_url: "https://yourwebsite.com/payment/success",
        website_url: "https://yourwebsite.com",
        amount: amount * 100, // Khalti requires amount in paisa
        purchase_order_id: purchaseOrderId,
        purchase_order_name: "Course Purchase",
      }
    );

    return response.data; // This contains the Khalti payment URL
  } catch (error) {
    console.error("Khalti Initiation Error:", error.response?.data || error);
    throw new Error(error.response ? error.response.data.detail : error.message);
  }
};

// Function to verify Khalti payment
const verifyPayment = async (token, amount) => {
  try {
    const response = await axios.post(
      `${khaltiConfig.baseURL}/verify/`,
      {
        token: token,
        amount: amount * 100
      },
      {
        headers: { Authorization: `Key ${KHALTI_SECRET_KEY}` }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Khalti Verification Error:", error.response?.data || error);
    throw new Error(error.response ? error.response.data.detail : error.message);
  }
};

module.exports = { createPayment, verifyPayment };
