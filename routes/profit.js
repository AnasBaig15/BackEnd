const express = require("express");
const router = express.Router();
const { Profit } = require("../modals/profit");
const mongoose = require("mongoose");

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    let profitData = await Profit.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (!profitData) {
      profitData = new Profit({
        userId: new mongoose.Types.ObjectId(userId),
        totalCredit: 0,
        totalDebit: 0,
      });
      await profitData.save();
    }

    res.json(profitData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
