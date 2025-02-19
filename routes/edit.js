const express = require("express");
const router = express.Router();
const { Transaction } = require("../modals/credit_debit");

router.put("/:id", async (req, res) => {
  try {
    const { amount, description, date } = req.body;
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { amount, description, date },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ message: "Transaction updated", updatedTransaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
