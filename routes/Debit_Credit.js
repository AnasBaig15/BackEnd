const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Transaction } = require("../modals/credit_debit");
const { Profit } = require("../modals/profit");
const {authenticate} = require("../middlewares/authenticate");

async function updateProfit(userId) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [creditResult, debitResult] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: userObjectId, type: "credit" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: userObjectId, type: "debit" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const totalCredit = creditResult[0]?.total || 0;
    const totalDebit = debitResult[0]?.total || 0;

    await Profit.findOneAndUpdate(
      { userId: userObjectId },
      { totalCredit, totalDebit },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error updating profit:", error.message);
    throw error;
  }
}

router.post("/add", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, amount, description, date } = req.body;

    const transaction = new Transaction({
      userId,
      type: type.toLowerCase(),
      amount,
      description: description || "",
      date: date || new Date(),
    });

    await transaction.save();
    await updateProfit(userId);
    
    const profitDoc = await Profit.findOne({ userId });

    if (!profitDoc) {
      return res.status(500).json({ error: "Profit document not found" });
    }

    res.status(201).json({
      transaction: {
        _id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
      },
      profit: { 
        totalCredit: profitDoc.totalCredit, 
        totalDebit: profitDoc.totalDebit,
      }
    });
  } catch (error) {
    console.error("Error in /add transaction:", error.message);
    res.status(500).json({ error: error.message });
  }
});
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
