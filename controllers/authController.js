const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModal = require("../modals/user-model");
const { generateToken } = require("../utils/generateToken");

module.exports.registerUser = async function (req, res) {
  try {
    let { email, password, fullname } = req.body;
    let user = await userModal.findOne({ email: email });
    if (user) return res.status(401).send("Your account already exist");
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) return res.send(err.message);
        else {
          let user = await userModal.create({
            email,
            password: hash,
            fullname,
          });
          let token = generateToken(user);
          res.cookie("token", token);
          res.send("user created successfully");
        }
      });
    });
  } catch (err) {
    console.log(err.message);
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


