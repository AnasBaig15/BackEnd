const mongoose = require("mongoose");

const profitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  totalCredit: { type: Number, default: 0 },
  totalDebit: { type: Number, default: 0 },
});

profitSchema.virtual("profit").get(function () {
  return this.totalCredit - this.totalDebit;
});

profitSchema.set("toJSON", { virtuals: true });

const Profit = mongoose.model("Profit", profitSchema);
module.exports = { Profit };
