const mongoose = require("mongoose");
const uniswapSchema = new mongoose.Schema({
  type: String,
  address: String,
  amount: String,
  vault: String,
  tx_id: String,
  status: String,
  createAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("uniswap", uniswapSchema);
