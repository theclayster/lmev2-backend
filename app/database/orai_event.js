const mongoose = require("mongoose");
const oraiEventSchema = new mongoose.Schema({
    method: String,
    block_number: String,
    from_address: String,
    to_address: String,
    addres_pool: String,
    tx_hash: String,
    tokenA: String,
    tokennB: String,
    amountADesired: String,
    amountBDesired: String,
    amountAMin: String,
    amountBMin: String,
    to: String,
    deadline: String,
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("orai_event", oraiEventSchema);
