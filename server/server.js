require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { createServer } = require("http");
const { Server } = require("socket.io");
const Chat = require("./models/Chat");
const User = require("./models/User");



const authRoutes = require("./routes/auth-routes/index");
const mediaRoutes = require("./routes/instructor-routes/media-routes");
const instructorCourseRoutes = require("./routes/instructor-routes/course-routes");
const studentViewCourseRoutes = require("./routes/student-routes/course-routes");
const studentViewOrderRoutes = require("./routes/student-routes/order-routes");
const studentCoursesRoutes = require("./routes/student-routes/student-courses-routes");
const studentCourseProgressRoutes = require("./routes/student-routes/course-progress-routes");
const khaltiPaymentRoutes = require("./routes/student-routes/khalti-payment-routes");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"], // Force WebSockets
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Database connection
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((e) => console.error("❌ MongoDB Connection Error:", e));

// Fetch all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "_id userName");
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Fetch chat history between two users
app.get("/api/chats/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    console.log(`🕵️ Fetching chat between ${user1} and ${user2}`);
    const chats = await Chat.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    }).sort({ createdAt: 1 });
    console.log("📜 Fetched messages:", chats);
    res.json(chats);
  } catch (error) {
    console.error("❌ Error fetching chat history:", error);
    res.status(500).json({ message: "Error fetching chat history" });
  }
});

// Socket.io real-time chat handling
const userSockets = new Map();

io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  socket.on("registerUser", (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`🔗 User ${userId} registered on socket ${socket.id}`);
    console.log("🗺️ Active Users:", [...userSockets.entries()]);
  });

  socket.on("sendMessage", async (data) => {
    console.log("📩 Message received:", data);

    const { senderId, receiverId, message } = data;

    try {
      const newChat = new Chat({ senderId, receiverId, message });
      const savedChat = await newChat.save();
      console.log("✅ Message saved:", savedChat);

      const receiverSocketId = userSockets.get(receiverId);
      console.log(`📨 Sending to ${receiverId} on socket ${receiverSocketId}`);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", savedChat);
      } else {
        console.log("🚨 Receiver is offline, message saved in DB only.");
      }
    } catch (error) {
      console.error("❌ Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    for (const [key, value] of userSockets.entries()) {
      if (value === socket.id) {
        userSockets.delete(key);
        break;
      }
    }
    console.log("🗺️ Active users after disconnect:", [...userSockets.entries()]);
  });
});

// Routes configuration
app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);
app.use("/instructor/course", instructorCourseRoutes);
app.use("/student/course", studentViewCourseRoutes);
app.use("/student/order", studentViewOrderRoutes);
app.use("/student/courses-bought", studentCoursesRoutes);
app.use("/student/course-progress", studentCourseProgressRoutes);
app.use("/payment/khalti-return", khaltiPaymentRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Global Error Handler:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
