const jwt = require("jsonwebtoken");
const userModel = require("../modals/user-model");

module.exports = async function (req, res, next) {
    try {
        if (!req.cookies.token) {
            req.flash("error", "You need to login first");
            return res.redirect("/");
        }
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);

        const user = await userModel.findOne({ email: decoded.email }).select("-password");

        if (!user) {
            req.flash("error", "Invalid token or user does not exist");
            return res.redirect("/");
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Authentication Error:", err.message);
        req.flash("error", "Something went wrong. Please login again.");
        res.redirect("/");
    }
};
