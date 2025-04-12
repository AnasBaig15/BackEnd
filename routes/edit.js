const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Transaction } = require("../modals/credit_debit");
const { Profit } = require("../modals/profit");

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

    const updatedProfit = await Profit.findOneAndUpdate(
      { userId: userObjectId },
      { totalCredit, totalDebit, netProfit: totalCredit - totalDebit },
      { upsert: true, new: true }
    );

    return updatedProfit;
  } catch (error) {
    console.error("Error updating profit:", error.message);
    throw error;
  }
}

router.put("/:id", async (req, res) => {
  try {
    const { amount, description, date, type } = req.body;
    const transactionId = req.params.id;

    const existingTransaction = await Transaction.findById(transactionId);
    if (!existingTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const userId = existingTransaction.userId;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { amount, description, date, type },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ error: "Failed to update transaction" });
    }

    const updatedProfit = await updateProfit(userId);

    res.json({
      message: "Transaction updated",
      updatedTransaction,
      profit: {
        totalCredit: updatedProfit.totalCredit,
        totalDebit: updatedProfit.totalDebit,
        netProfit: updatedProfit.totalCredit - updatedProfit.totalDebit,
      },
    });
  } catch (error) {
    console.error("Error updating transaction:", error.message);
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;