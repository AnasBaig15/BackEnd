const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middlewares/auth');
const { Transaction } = require('../modals/credit_debit');

router.get("/all-transactions", adminAuth, async (req, res) => {
  const transactions = await Transaction.find().populate("userId", "name email");
  res.json(transactions);
});

router.delete("/delete-all", adminAuth, async (req, res) => {
  await Transaction.deleteMany();
  res.status(200).json({ message: "All transactions deleted successfully" });
});

module.exports = router;
