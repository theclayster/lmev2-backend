const mongoose = require("mongoose");
const claimSchema = new mongoose.Schema({
    address: String,
    to: String,
    buyer: String,
    amount: Number,
    tx_id: String,
    createAt: {type: Date, default: Date.now},
    updateAt: {type: Date, default: Date.now},
});
module.exports = mongoose.model("claim", claimSchema);
