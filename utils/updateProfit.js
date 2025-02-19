const { Transaction, Profit } = require("../modals/profit");

const updateProfit = async () => {
  const totalCredit = await Transaction.aggregate([
    { $match: { type: "credit" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalDebit = await Transaction.aggregate([
    { $match: { type: "debit" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalCreditValue = totalCredit[0]?.total || 0;
  const totalDebitValue = totalDebit[0]?.total || 0;
  const profit = totalCreditValue - totalDebitValue;

  await Profit.findOneAndUpdate(
    {},
    { totalCredit: totalCreditValue, totalDebit: totalDebitValue, profit },
    { upsert: true, new: true }
  );
};

module.exports = { updateProfit };
