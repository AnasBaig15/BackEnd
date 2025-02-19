const jwt = require("jsonwebtoken");
const User = require("../modals/user-model");

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization") && req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Access denied. Admins only!" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { adminAuth };
