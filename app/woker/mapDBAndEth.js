const UniswapDB = require("../database/uniswap");
const dbConfig = require("../database/db_config");
const network_eth = require("../blockchain/network/eth")
const web3 = network_eth.get_lib_main_net()

const mongoose = require("mongoose");

// config mongo
mongoose.connect(dbConfig.dbs, {
    useNewUrlParser: true,
});


async function mapCheckDbAndPool(address_pool){
    
    get_all_db = await UniswapDB.find()
    for (let i = 0; i < get_all_db.length; i++) {
        get_tx_receipt = await web3.eth.getTransactionReceipt(get_all_db.tx_id)
        console.log(get_tx_receipt);
    }

} 
mapCheckDbAndPool("0xb3426078e2bc85eddea342f2a5dcf0b24e70bf4b")