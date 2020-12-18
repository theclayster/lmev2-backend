const mongoose = require("mongoose");
const transactionLockSchema = new mongoose.Schema({
  block_number: Number,
  from: String,
  to: String,
  hash: String,
  address_pool: String,
  amount: String,
  unlock_date: String,
  createAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("transaction_lock", transactionLockSchema);
