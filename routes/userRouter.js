const express = require("express");
const router = express.Router();
const {registerUser, logoutUser} = require("../controllers/authController")
const {loginUser} = require("../controllers/authController")
router.get("/", function (req, res) {
  res.send("hi");
});
router.post("/register",registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
module.exports = router;
