const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModal = require("../modals/user-model");
const { generateToken } = require("../utils/generateToken");

module.exports.registerUser = async function (req, res) {
  try {
    let { email, password, fullname } = req.body;

    // Check if user already exists
    let user = await userModal.findOne({ email });
    if (user) {
      return res.status(401).json({ message: "Your account already exists" });
    }

    // Hash password
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        console.error("Error generating salt:", err);
        return res.status(500).json({ message: "Server error. Try again." });
      }

      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) {
          console.error("Error hashing password:", err);
          return res.status(500).json({ message: "Error hashing password." });
        }

        try {
          let newUser = await userModal.create({
            email,
            password: hash,
            fullname,
          });

          let token = generateToken(newUser);
          res.cookie("token", token, { httpOnly: true });

          return res.status(201).json({ message: "User created successfully", token });
        } catch (dbError) {
          console.error("Error saving user:", dbError);
          return res.status(500).json({ message: "Database error. Try again." });
        }
      });
    });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports.loginUser = async function (req, res) {
  const { email, password } = req.body;
  try {
    const user = await userModal.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Email or password incorrect" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Email or password incorrect" });
    }

    const token = generateToken(user);
    const decoded = jwt.verify(token, process.env.JWT_KEY);
      console.log(decoded);

    res.json({
      message: "User logged in successfully",
      token: token
    });

  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.logoutUser = function (req, res) {
  res.clearCookie("token");
  req.flash("success", "Logged out successfully");
  res.send("logged out");
};


