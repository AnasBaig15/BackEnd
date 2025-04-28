const express = require("express");
const router = express.Router();
const { Profit } = require("../modals/profit");

router.get("/", async (req, res) => {
  try {
    const allProfits = await Profit.find().sort({ userId: 1 }); 

    res.status(200).json(allProfits);
  } catch (error) {
    console.error("Error fetching all profits:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

