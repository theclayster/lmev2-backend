
const eth_network = require("../blockchain/network/eth")
const OraiEnventDB = require("../database/orai_event");
const mongoose = require("mongoose");
const dbConfig = require("../database/db_config");
const InputDataDecoder = require("ethereum-input-data-decoder");

// *********************************************
// Infomation config
const ADDRESS_POOL = "0x9081b50bad8beefac48cc616694c26b027c559bb"
// abi of contract pool
const oraiPool = require("../blockchain/abi/orai_pool.json")
// config mongo
mongoose.connect(dbConfig.dbs, {
    useNewUrlParser: true,
});
// init decode
const decoder = new InputDataDecoder(oraiPool)
// *********************************************

async function listenLog(address) {
    console.log("woker listen event address : ", address);

    eth_network.get_lib_main_net_socket().eth.subscribe('logs', {
        address: address
    }, async function (err, resp) {
        if (err) {
            console.log("this is log error of oraiEvent worker ", err);
            return
        }
        try {
            analysis_transaction(resp.transactionHash, address)
            return
        } catch (error) {
            console.log("this is log error when listenLog worker", error)
            return
        }
    })
}

async function analysis_transaction(tx, address) {
    try {
        check_exits_tx = await OraiEnventDB.findOne({ "tx_hash": tx })
        if (check_exits_tx) {
            console.log("transaction  " + tx + " already exist");
            return
        }
        data = await eth_network.get_lib_main_net().eth.getTransaction(tx)
        input_data = data.input

        result = await decoder.decodeData(input_data)
        if (result.method == "addLiquidity") {
            get_tx_receipt = await eth_network.get_lib_main_net().eth.getTransactionReceipt(tx)
            data_insert = {
                "method": result.method,
                "block_number": data.blockNumber,
                "from_address": data.from.toLowerCase(),
                "to_address": data.to.toLowerCase(),
                "addres_pool": address,
                "tx_hash": tx,
                "tokenA": "0x" + result.inputs[0],
                "tokenB": "0x" + result.inputs[1],
                "amountADesired": result.inputs[2],
                "amountBDesired": result.inputs[3],
                "amountAMin": result.inputs[4],
                "amountBMin": result.inputs[5],
                "to": "0x" + result.inputs[6],
                "deadline": result.inputs[7],
                "liquidity": eth_network.get_lib_main_net().utils.hexToNumberString(get_tx_receipt.logs[3].data)
            }
            result_insert = await OraiEnventDB.findOneAndUpdate({ tx_hash: tx }, data_insert, { new: true, upsert: true })
            console.log("record id method addLiquidity", result_insert._id);
            return

        }
        if (result.method == "addLiquidityETH") {

            get_tx_receipt = await eth_network.get_lib_main_net().eth.getTransactionReceipt(tx)
            data_insert = {
                "method": result.method,
                "block_number": data.blockNumber,
                "from_address": data.from.toLowerCase(),
                "to_address": data.to.toLowerCase(),
                "addres_pool": address,
                "tx_hash": tx,
                "token": "0x" + result.inputs[0],
                "amountTokenDesired": result.inputs[1],
                "amountTokenMin": result.inputs[2],
                "amountETHMin": result.inputs[3],
                "to": "0x" + result.inputs[4],
                "deadline": result.inputs[5],
                "liquidity": eth_network.get_lib_main_net().utils.hexToNumberString(get_tx_receipt.logs[3].data)
            }
            result_insert = await OraiEnventDB.findOneAndUpdate({ tx_hash: tx }, data_insert, { new: true, upsert: true })
            console.log("record id method addLiquidityETH", result_insert._id);
            return
        }
        if (result.method == "removeLiquidityETH") {
            data_insert = {
                "method": result.method,
                "block_number": data.blockNumber,
                "from_address": data.from.toLowerCase(),
                "to_address": data.to.toLowerCase(),
                "addres_pool": address,
                "tx_hash": tx,
                "token": "0x" + result.inputs[0],
                "liquidity": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[1]),
                "amountTokenMin": result.inputs[2],
                "amountETHMin": result.inputs[3],
                "to": "0x" + result.inputs[4],
                "deadline": result.inputs[5]
            }
            result_insert = await OraiEnventDB.findOneAndUpdate({ tx_hash: tx }, data_insert, { new: true, upsert: true })
            console.log("record id method removeLiquidityETH", result_insert._id);
            return
        }
        if (result.method == "removeLiquidity") {
            data_insert = {
                "method": result.method,
                "block_number": data.blockNumber,
                "from_address": data.from.toLowerCase(),
                "to_address": data.to.toLowerCase(),
                "addres_pool": address,
                "tx_hash": tx,
                "tokenA": "0x" + result.inputs[0],
                "tokenB": "0x" + result.inputs[1],
                "liquidity": result.inputs[2],
                "amountAMin": result.inputs[3],
                "amountBMin": result.inputs[4],
                "to": "0x" + result.inputs[5],
                "deadline": result.inputs[6]
            }
            result_insert = await OraiEnventDB.findOneAndUpdate({ tx_hash: tx }, data_insert, { new: true, upsert: true })
            console.log("record id method removeLiquidity", result_insert._id);
            return
        }
        if (result.method == "removeLiquidityWithPermit") {
            data_insert = {
                "method": result.method,
                "block_number": data.blockNumber,
                "from_address": data.from.toLowerCase(),
                "to_address": data.to.toLowerCase(),
                "addres_pool": address,
                "tx_hash": tx,
                "tokenA": "0x" + result.inputs[0],
                "tokenB": "0x" + result.inputs[1],
                "liquidity": result.inputs[2],
                "amountAMin": result.inputs[3],
                "amountBMin": result.inputs[4],
                "to": "0x" + result.inputs[5],
                "deadline": result.inputs[6],
                "approveMax": result.inputs[7],
                "v": result.inputs[8],
                "r": "0x" + result.inputs[9],
                "s": "0x" + result.inputs[10]
            }
            result_insert = await OraiEnventDB.findOneAndUpdate({ tx_hash: tx }, data_insert, { new: true, upsert: true })
            console.log("record id method removeLiquidityWithPermit", result_insert._id);
            return
        }
        if (result.method == "removeLiquidityETHWithPermit") {
            data_insert = {
                "method": result.method,
                "block_number": data.blockNumber,
                "from_address": data.from.toLowerCase(),
                "to_address": data.to.toLowerCase(),
                "addres_pool": address,
                "tx_hash": tx,
                "token": "0x" + result.inputs[0],
                "liquidity": result.inputs[1],
                "amountTokenMin": result.inputs[2],
                "amountETHMin": result.inputs[3],
                "to": "0x" + result.inputs[4],
                "deadline": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[5]),
                "approveMax": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[6]),
                "v": result.inputs[7],
                "r": "0x" + eth_network.get_lib_main_net().utils.bytesToHex(result.inputs[8]),
                "s": "0x" + eth_network.get_lib_main_net().utils.bytesToHex(result.inputs[9])
            }
            result_insert = await OraiEnventDB.findOneAndUpdate({ tx_hash: tx }, data_insert, { new: true, upsert: true })
            console.log("record id method removeLiquidityETHWithPermit", result_insert._id);
            return
        }
        return
    } catch (error) {
        console.log("this is error when analysis_transaction ", tx, error);
        return
    }

}

listenLog(ADDRESS_POOL)

// analysis_transaction("0x24aa86ea2293b03c130d96e61693de855e6ecc136e8f06eee14345545e81c7f9", "test")