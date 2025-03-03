const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { userName, userEmail, password, role, esewaNumber } = req.body;

  if (!userName || !userEmail || !password || !role) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  if (role === "instructor" && !esewaNumber) {
    return res.status(400).json({ success: false, message: "Esewa number is required for instructors" });
  }

  const allowedRoles = ["user", "instructor"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role selected" });
  }

  const existingUser = await User.findOne({ $or: [{ userEmail }, { userName }] });

  if (existingUser) {
    return res.status(400).json({ success: false, message: "User name or user email already exists" });
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    userName,
    userEmail,
    role,
    password: hashPassword,
    esewaNumber: role === "instructor" ? esewaNumber : null, // Store esewaNumber only for instructors
  });

  await newUser.save();

  return res.status(201).json({
    success: true,
    message: "User registered successfully!",
    user: {
      _id: newUser._id,
      userName: newUser.userName,
      userEmail: newUser.userEmail,
      role: newUser.role,
      esewaNumber: newUser.esewaNumber, 
    },
  });
};


const loginUser = async (req, res) => {
  const { userEmail, password } = req.body;

  const checkUser = await User.findOne({ userEmail });
  const isPasswordValid = checkUser && (await bcrypt.compare(password, checkUser?.password));

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const accessToken = jwt.sign(
    {
      _id: checkUser._id,
      userName: checkUser.userName,
      userEmail: checkUser.userEmail,
      role: checkUser.role,
    },
    process.env.JWT_SECRET, // ✅ Use the same secret key
    { expiresIn: "120m" }
  );
  
  
  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: {
      accessToken,
      user: {
        _id: checkUser._id,
        userName: checkUser.userName,
        userEmail: checkUser.userEmail,
        role: checkUser.role,
      },
    },
  });
};

module.exports = { registerUser, loginUser };