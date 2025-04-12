const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModal = require("../modals/user-model");
const { generateToken } = require("../utils/generateToken");

module.exports.registerUser = async function (req, res) {
  try {
    let { email, password, fullname } = req.body;

    let existingUser = await userModal.findOne({ email });
    if (existingUser) {
      return res.status(401).json({ message: "Your account already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser = await userModal.create({
      email,
      password: hashedPassword,
      fullname,
    });

    let token = generateToken(newUser);
    res.cookie("token", token, { httpOnly: true });

    return res.status(201).json({ message: "User created successfully", token });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports.loginUser = async function (req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModal.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user);
    res.cookie("token", token, { httpOnly: true });

    return res.json({
      message: "User logged in successfully",
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.logoutUser = function (req, res) {
  res.clearCookie("token");
  return res.json({ message: "Logged out successfully" });
};


