const express = require("express");
const router = express.Router();
const { Transaction } = require("../modals/credit_debit");
const { adminAuth} = require("../middlewares/auth")

router.get("/", adminAuth, async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
