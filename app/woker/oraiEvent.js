
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
        }
        try {
            analysis_transaction(resp.transactionHash, address)
        } catch (error) {
            console.log("this is log error when analysis worker", error)
        }
    })
}

async function analysis_transaction(tx, address) {
    try {
        data = await eth_network.get_lib_main_net().eth.getTransaction(tx)
        input_data = data.input

        result = decoder.decodeData(input_data)
        if (result.method == "addLiquidity") {
            data_insert = {
                "method": result.method,
                "block_number": data.blockNumber,
                "from_address": data.from.toLowerCase(),
                "to_address": data.to.toLowerCase(),
                "addres_pool": address,
                "tx_hash": tx,
                "tokenA": "0x" + result.inputs[0].toLowerCase(),
                "tokennB": "0x" + result.inputs[1].toLowerCase(),
                "amountADesired": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[2]),
                "amountBDesired": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[3]),
                "amountAMin": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[4]),
                "amountBMin": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[5]),
                "to": "0x" + result.inputs[6].toLowerCase(),
                "deadline": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[7])
            }
            result_insert = await new OraiEnventDB(data_insert).save()
            console.log("record id method addLiquidity", result_insert._id);
        }
        if (result.method == "addLiquidityETH") {
            data_insert = {
                "method": result.method,
                "block_number": data.blockNumber,
                "from_address": data.from.toLowerCase(),
                "to_address": data.to.toLowerCase(),
                "addres_pool": address,
                "tx_hash": tx,
                "token": "0x" + result.inputs[0].toLowerCase(),
                "amountTokenDesired": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[1]),
                "amountTokenMin": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[2]),
                "amountETHMin": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[3]),
                "to": "0x" + result.inputs[4].toLowerCase(),
                "deadline": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[5])
            }
            result_insert = await new OraiEnventDB(data_insert).save()
            console.log("record id method addLiquidityETH", result_insert._id);
        }
        if (result.method == "removeLiquidityETH") {
            data_insert = {
                "method": result.method,
                "block_number": data.blockNumber,
                "from_address": data.from.toLowerCase(),
                "to_address": data.to.toLowerCase(),
                "addres_pool": address,
                "tx_hash": tx,
                "token": "0x" + result.inputs[0].toLowerCase(),
                "liquidity": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[1]),
                "amountTokenMin": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[2]),
                "amountETHMin": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[3]),
                "to": "0x" + result.inputs[4].toLowerCase(),
                "deadline": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[5])
            }
            result_insert = await new OraiEnventDB(data_insert).save()
            console.log("record id method removeLiquidityETH", result_insert._id);
        }
        if (result.method == "removeLiquidity") {
            data_insert = {
                "method": result.method,
                "block_number": data.blockNumber,
                "from_address": data.from.toLowerCase(),
                "to_address": data.to.toLowerCase(),
                "addres_pool": address,
                "tx_hash": tx,
                "tokenA": "0x" + result.inputs[0].toLowerCase(),
                "tokenB": "0x" + result.inputs[1].toLowerCase(),
                "liquidity": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[2]),
                "amountAMin": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[3]),
                "amountBMin": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[4]),
                "to": "0x" + result.inputs[5].toLowerCase(),
                "deadline": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[6])
            }
            result_insert = await new OraiEnventDB(data_insert).save()
            console.log("record id method removeLiquidity", result_insert._id);
        }
        if (result.method == "removeLiquidityWithPermit") {
            data_insert = {
                "method": result.method,
                "block_number": data.blockNumber,
                "from_address": data.from.toLowerCase(),
                "to_address": data.to.toLowerCase(),
                "addres_pool": address,
                "tx_hash": tx,
                "tokenA": "0x" + result.inputs[0].toLowerCase(),
                "tokennB": "0x" + result.inputs[1].toLowerCase(),
                "liquidity": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[2]),
                "amountAMin": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[3]),
                "amountBMin": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[4]),
                "to": "0x" + result.inputs[5].toLowerCase(),
                "deadline": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[6]),
                "approveMax": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[7]),
                "v": result.inputs[8],
                "r": "0x" + eth_network.get_lib_main_net().utils.bytesToHex(result.inputs[9]),
                "s": "0x" + eth_network.get_lib_main_net().utils.bytesToHex(result.inputs[10])
            }
            result_insert = await new OraiEnventDB(data_insert).save()
            console.log("record id method removeLiquidityWithPermit", result_insert._id);
        }
    } catch (error) {
        console.log("this is error when analysis_transaction ", error);
    }

}

listenLog(ADDRESS_POOL)