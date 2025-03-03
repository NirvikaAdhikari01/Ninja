const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");

const axios = require("axios");




const createOrder = async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
      coursePricing,
      token, // Khalti payment token from frontend
    } = req.body;

    // Use environment variable for secret key
    const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;

    // Khalti Verification API
    const khaltiVerifyUrl = "https://a.khalti.com/api/v2/payment/verify/";

    const verifyData = {
      token: token,
      amount: coursePricing * 100, // Khalti requires amount in paisa
    };

    const headers = {
      Authorization: `Key ${khaltiSecretKey}`,
      "Content-Type": "application/json",
    };

    // Verify payment with Khalti API
    const response = await axios.post(khaltiVerifyUrl, verifyData, { headers });

    // Ensure response has correct state
    if (!response.data.state || response.data.state.name !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed!",
      });
    }

    // Create Order
    const newlyCreatedCourseOrder = new Order({
      userId,
      userName,
      userEmail,
      orderStatus: "confirmed",
      paymentMethod: "Khalti",
      paymentStatus: "paid",
      orderDate: new Date(),
      paymentId: response.data.idx, // Payment ID from Khalti
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
      coursePricing,
    });

    await newlyCreatedCourseOrder.save();

    res.status(201).json({
      success: true,
      message: "Payment successful and order created!",
      orderId: newlyCreatedCourseOrder._id,
    });
  } catch (err) {
    console.error("Khalti Payment Error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: "Error processing Khalti payment!",
    });
  }
};


const capturePaymentAndFinalizeOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    await order.save();

    // Update StudentCourses
    const studentCourses = await StudentCourses.findOne({ userId: order.userId });

    if (studentCourses) {
      studentCourses.courses.push({
        courseId: order.courseId,
        title: order.courseTitle,
        instructorId: order.instructorId,
        instructorName: order.instructorName,
        dateOfPurchase: order.orderDate,
        courseImage: order.courseImage,
      });
      await studentCourses.save();
    } else {
      const newStudentCourses = new StudentCourses({
        userId: order.userId,
        courses: [
          {
            courseId: order.courseId,
            title: order.courseTitle,
            instructorId: order.instructorId,
            instructorName: order.instructorName,
            dateOfPurchase: order.orderDate,
            courseImage: order.courseImage,
          },
        ],
      });
      await newStudentCourses.save();
    }

    // Update Course Schema to add student
    await Course.findByIdAndUpdate(order.courseId, {
      $addToSet: {
        students: {
          studentId: order.userId,
          studentName: order.userName,
          studentEmail: order.userEmail,
          paidAmount: order.coursePricing,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Order confirmed successfully!",
      data: order,
    });
  } catch (err) {
    console.error("Error in finalizing order:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while confirming the order!",
    });
  }
};

const initiateKhaltiPayment = async (req, res) => {
  try {
    const { userId, coursePricing, purchaseOrderId, purchaseOrderName } = req.body;

    const khaltiInitiateUrl = "https://a.khalti.com/api/v2/epayment/initiate/";
    const khaltiSecretKey = process.env.KHALTI_SECRET_KEY; // Use env variable

    const requestBody = {
      return_url: "https://your-frontend.com/payment-success",
      website_url: "https://your-website.com",
      amount: coursePricing * 100, // Convert to paisa
      purchase_order_id: purchaseOrderId,
      purchase_order_name: purchaseOrderName,
      customer_info: {
        user_id: userId,
      },
    };

    const headers = {
      Authorization: `Key ${khaltiSecretKey}`,
      "Content-Type": "application/json",
    };

    // Correct Axios Request
    const response = await axios.post(khaltiInitiateUrl, requestBody, { headers });

    res.status(200).json({
      success: true,
      message: "Payment initiation successful",
      pidx: response.data.pidx, // Unique Payment ID
      payment_url: response.data.payment_url, // URL for user to complete payment
    });
  } catch (error) {
    console.error("Khalti Initiation Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Error initiating Khalti payment!",
    });
  }
};


module.exports = { createOrder, capturePaymentAndFinalizeOrder, initiateKhaltiPayment };



