const express = require("express");
const router = express.Router();
const { Transaction } = require("../modals/credit_debit");
const { adminAuth } = require("../middlewares/auth");


router.delete("/:userId", adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only!" });
    }

    await Transaction.deleteMany({ userId });

    res.status(200).json({ message: `All transactions for user ${userId} deleted successfully` });
  } catch (error) {
    console.error("Error deleting user's transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
