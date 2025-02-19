const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const userModel = require("../modals/user-model");

router.post("/create-admin", async (req, res) => {
    const { email, password, fullname } = req.body;

    let user = await userModel.findOne({ email });
    if (user) {
        return res.status(400).send("Admin user already exists");
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new userModel({
            email,
            password: hashedPassword,
            fullname,
            isAdmin: true,
        });

        await user.save();
        res.status(201).send("Admin user created successfully!");
    } catch (error) {
        console.log(error);
        res.status(500).send("Server error");
    }
});
router.get("/admins", async (req, res) => {
    try {
        const admins = await userModel.find({ isAdmin: true });
        res.json(admins);
    } catch (error) {
        res.status(500).send("Server error");
    }
});

module.exports = router;