const mongoose = require("mongoose");
const oraiEventSchema = new mongoose.Schema({
    block_number: String,
    from: String,
    to: String,
    tx_hash: String,
    addres_pool: String,
    amount: String,
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("orai_event", oraiEventSchema);
