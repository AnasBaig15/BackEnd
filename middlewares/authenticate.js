const jwt = require("jsonwebtoken");
const User = require("../modals/user-model");

const authenticate = async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
  
      if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      console.log("Decoded JWT:", decoded);  
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
  
      req.user = user;
      next();
    } catch (err) {
      console.error("Authentication Error:", err.message);
      return res.status(401).json({ error: "Invalid token" });
    }
  };
  module.exports = { authenticate };