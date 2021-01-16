const mongoose = require("mongoose");
const lockrewardSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  seedSale: { type: Number, required: true, default: 0 },
  ORAIVault: { type: Number, required: true, default: 0 },
  USDTVault: { type: Number, required: true, default: 0 },
});
module.exports = mongoose.model("lockreward", lockrewardSchema);
