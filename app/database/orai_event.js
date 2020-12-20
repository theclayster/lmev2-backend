const mongoose = require("mongoose");
const oraiEventSchema = new mongoose.Schema({
    method: String,
    block_number: String,
    from_address: String,
    to_address: String,
    addres_pool: String,
    tx_hash: { type: String, unique: true, required: true, dropDups: true },
    token: String,
    tokenA: String,
    tokenB: String,
    liquidity: String,
    amountADesired: String,
    amountBDesired: String,
    amountTokenDesired: String,
    amountTokenMin: String,
    amountETHMin: String,
    amountAMin: String,
    amountBMin: String,
    to: String,
    deadline: String,
    v: String,
    r: String,
    s: String,
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("orai_event", oraiEventSchema);
