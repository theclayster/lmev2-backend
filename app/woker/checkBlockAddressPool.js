
const eth_network = require("../blockchain/network/eth")
const web3 = eth_network.get_lib_main_net()
const OraiEnventDB = require("../database/orai_event");
const mongoose = require("mongoose");
const dbConfig = require("../database/db_config");
const InputDataDecoder = require("ethereum-input-data-decoder");
const axios = require('axios');
// *********************************************
// Infomation config
// abi of contract pool
const oraiPool = require("../blockchain/abi/orai_pool.json")
// config mongo
mongoose.connect(dbConfig.dbs, {
    useNewUrlParser: true,
});
// init decode
const decoder = new InputDataDecoder(oraiPool)
// *********************************************
// ***********************************************************************
const ADDRESS_ROUTER_UNISWAP = "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"
const ADDRESS_POOL = "0x9081b50bad8beefac48cc616694c26b027c559bb"
const BLOCK_START = 11494926
// ***********************************************************************

async function check_block_address_pool(block_number, address_pool) {


    if (ADDRESS_ROUTER_UNISWAP == undefined) {
        console.log("System error! Address router uniswap underfined. " +
            "Admin need config variable ADDRESS_ROUTER_UNISWAP=0x7a250d5630b4cf539739df2c5dacb4c659f2488d in file environment .env");
    }

    axios.get("https://api.etherscan.io/api?module=account&action=txlist&address=" +
        "0x7a250d5630b4cf539739df2c5dacb4c659f2488d" + "&startblock=" + block_number + "&endblock=99999999&sort=asc&apikey=PJZTHQZRS1MTRUHTUHVHVYKBYX1RQVGPXP")
        .then(async function (response) {
            data_resp = response.data.result

            data_transaction = []
            try {
                for (let i = 0; i < data_resp.length; i++) {
                    console.log("Value variable count = ", i);
                    console.log("Value variable block number  = ", data_resp[i].blockNumber);
                    console.log("Value variable tx  = ", data_resp[i].hash);

                    check_exits_tx = await OraiEnventDB.findOne({ "tx_hash": data_resp[i].hash })
                    if (check_exits_tx) {
                        console.log("transaction  " + data_resp[i].hash + " already exist");

                    }

                    get_tx_receipt = await web3.eth.getTransactionReceipt(data_resp[i].hash)
                    console.log(data_resp[i].hash);

                    if (get_tx_receipt.logs.length == 0 || (get_tx_receipt.logs[3].address).toLowerCase() != address_pool && (get_tx_receipt.logs[2].address).toLowerCase() != address_pool) {
                        console.log("address null");
                    } else {
                        data = await web3.eth.getTransaction(data_resp[i].hash)
                        result = await decoder.decodeData(data.input)

                        if (result.method == "addLiquidity") {
                            data_insert = {
                                "method": result.method,
                                "block_number": data.blockNumber,
                                "from_address": data.from.toLowerCase(),
                                "to_address": data.to.toLowerCase(),
                                "addres_pool": address_pool,
                                "tx_hash": data_resp[i].hash,
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
                            result_insert = await OraiEnventDB.findOneAndUpdate({ tx_hash: data_resp[i].hash }, data_insert, { new: true, upsert: true })
                            data_transaction.push(result_insert)

                        }
                        if (result.method == "addLiquidityETH") {
                            data_insert = {
                                "method": result.method,
                                "block_number": data.blockNumber,
                                "from_address": data.from.toLowerCase(),
                                "to_address": data.to.toLowerCase(),
                                "address_pool": address_pool,
                                "tx_hash": data_resp[i].hash,
                                "token": "0x" + result.inputs[0],
                                "amountTokenDesired": result.inputs[1],
                                "amountTokenMin": result.inputs[2],
                                "amountETHMin": result.inputs[3],
                                "to": "0x" + result.inputs[4],
                                "deadline": result.inputs[5],
                                "liquidity": eth_network.get_lib_main_net().utils.hexToNumberString(get_tx_receipt.logs[3].data)
                            }
                            result_insert = await OraiEnventDB.findOneAndUpdate({ tx_hash: data_resp[i].hash }, data_insert, { new: true, upsert: true })
                            data_transaction.push(result_insert)
                        }
                        if (result.method == "removeLiquidityETH") {
                            data_insert = {
                                "method": result.method,
                                "block_number": data.blockNumber,
                                "from_address": data.from.toLowerCase(),
                                "to_address": data.to.toLowerCase(),
                                "addres_pool": address_pool,
                                "tx_hash": data_resp[i].hash,
                                "token": "0x" + result.inputs[0],
                                "liquidity": eth_network.get_lib_main_net().utils.hexToNumberString(result.inputs[1]),
                                "amountTokenMin": result.inputs[2],
                                "amountETHMin": result.inputs[3],
                                "to": "0x" + result.inputs[4],
                                "deadline": result.inputs[5]
                            }
                            result_insert = await OraiEnventDB.findOneAndUpdate({ tx_hash: data_resp[i].hash }, data_insert, { new: true, upsert: true })
                            data_transaction.push(result_insert)
                        }
                        if (result.method == "removeLiquidity") {
                            data_insert = {
                                "method": result.method,
                                "block_number": data.blockNumber,
                                "from_address": data.from.toLowerCase(),
                                "to_address": data.to.toLowerCase(),
                                "addres_pool": address_pool,
                                "tx_hash": data_resp[i].hash,
                                "tokenA": "0x" + result.inputs[0],
                                "tokenB": "0x" + result.inputs[1],
                                "liquidity": result.inputs[2],
                                "amountAMin": result.inputs[3],
                                "amountBMin": result.inputs[4],
                                "to": "0x" + result.inputs[5],
                                "deadline": result.inputs[6]
                            }
                            result_insert = await OraiEnventDB.findOneAndUpdate({ tx_hash: data_resp[i].hash }, data_insert, { new: true, upsert: true })
                            data_transaction.push(result_insert)
                        }
                        if (result.method == "removeLiquidityETHWithPermit") {
                            data_insert = {
                                "method": result.method,
                                "block_number": data.blockNumber,
                                "from_address": data.from.toLowerCase(),
                                "to_address": data.to.toLowerCase(),
                                "addres_pool": address_pool,
                                "tx_hash": data_resp[i].hash,
                                "token": "0x" + result.inputs[0],
                                "liquidity": result.inputs[1],
                                "amountTokenMin": result.inputs[2],
                                "amountETHMin": result.inputs[3],
                                "to": "0x" + result.inputs[4],
                                "deadline": web3.utils.hexToNumberString(result.inputs[5]),
                                "approveMax": web3.utils.hexToNumberString(result.inputs[6]),
                                "v": result.inputs[7],
                                "r": "0x" + web3.utils.bytesToHex(result.inputs[8]),
                                "s": "0x" + web3.utils.bytesToHex(result.inputs[9])
                            }
                            result_insert = await OraiEnventDB.findOneAndUpdate({ tx_hash: data_resp[i].hash }, data_insert, { new: true, upsert: true })
                            data_transaction.push(result_insert)
                        }

                        if (result.method == "removeLiquidityWithPermit") {
                            data_insert = {
                                "method": result.method,
                                "block_number": data.blockNumber,
                                "from_address": data.from.toLowerCase(),
                                "to_address": data.to.toLowerCase(),
                                "addres_pool": address_pool,
                                "tx_hash": data_resp[i].hash,
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
                            result_insert = await OraiEnventDB.findOneAndUpdate({ tx_hash: data_resp[i].hash }, data_insert, { new: true, upsert: true })
                            data_transaction.push(result_insert)
                        }
                    }
                }
                console.log("list tx miss", data_transaction);
            } catch (error) {
                console.log("this is error when get tx", error);
            }
        })
        .catch(function (error) {
            // handle error
            console.log("error");
        })
}

check_block_address_pool(BLOCK_START, ADDRESS_POOL)