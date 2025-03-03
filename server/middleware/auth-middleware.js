const jwt = require("jsonwebtoken");
require("dotenv").config(); // Ensure environment variables are loaded

const verifyToken = (token, secretKey) => {
  return jwt.verify(token, secretKey);
};

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader, "authHeader"); // Debugging log

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "User is not authenticated",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token, process.env.JWT_SECRET); // ✅ Use actual secret key

    req.user = payload;
    console.log("Decoded Token:", payload); // Debugging log

    next();
  } catch (e) {
    console.log("Token Verification Error:", e.message); // Debugging log
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

module.exports = authenticate;
