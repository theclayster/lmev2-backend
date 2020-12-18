
const eth_network = require("../blockchain/network/eth")
const OraiEnventDB = require("../database/orai_event");
const mongoose = require("mongoose");
const dbConfig = require("../database/db_config");

// abi of contract pool
const oraiPool = require("../blockchain/abi/orai_pool_test.json")

// abi decode 
const oraiPoolTest = require("../blockchain/abi/test.json")

// config mongo
mongoose.connect(dbConfig.dbs, {
    useNewUrlParser: true,
});

async function listenLog(address) {
    console.log("woker listen event address : ", address);

    eth_network.get_lib_main_net_socket().eth.subscribe('logs', {
        address: address,
        topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef']
    }, async function (err, resp) {
        if (err) {
            console.log("this is log error of oraiEvent worker ", err);
        }
        try {
            if (eth_network.get_lib_main_net().utils.hexToNumberString("0x" + resp.topics[1].substr(26)) != '0') {
                data_insert = {
                    "block_number": resp.blockNumber,
                    "from": "0x" + resp.topics[1].substr(26).toLowerCase(),
                    "to": "0x" + resp.topics[2].substr(26).toLowerCase(),
                    "addres_pool": resp.address.toLowerCase(),
                    "tx_hash": resp.transactionHash,
                    "amount": eth_network.get_lib_main_net().utils.hexToNumberString(resp.data) / 1000000000000000000
                }
                data = await new OraiEnventDB(data_insert).save()
                console.log("record id", data._id);
            }
        } catch (error) {

        }
    })
}

listenLog("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2")
