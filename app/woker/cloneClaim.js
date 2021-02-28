const {validationResult, check, query} = require("express-validator");
const abiDecoder = require('abi-decoder');
const ClaimDB = require("../database/claim");
const network_eth = require("../blockchain/network/eth");
const web3 = network_eth.get_lib_main_net();
const requestPromise = require("request-promise");

const dbConfig = require("../database/db_config").dbs;
const mongoose = require("mongoose");
// config mongo
mongoose.connect(dbConfig, {
    useNewUrlParser: true,
});


const ABI = require("./worker_config/ABI");
const InputDataDecoder = require("ethereum-input-data-decoder");
const decoder = new InputDataDecoder(ABI.Reward_Contract.ABI);


async function cloneClaim() {
    console.log("vao day")
    get_all_tx = await requestPromise.get("https://api.etherscan.io/api?module=account&action=txlist&address=0x3d5c50f93c6b307de88b4c63212cca746673278f&startblock=11619369&endblock=99999999&sort=asc&apikey=PJZTHQZRS1MTRUHTUHVHVYKBYX1RQVGPXP");
    data_all_tx = JSON.parse(get_all_tx).result

    for (let i = 0; i < data_all_tx.length; i++) {
        console.log(i)
        try {
            get_tx = await web3.eth.getTransaction(data_all_tx[i].hash)
            decode_input = await decoder.decodeData(get_tx.input);
            if (typeof decode_input != "undefined" && decode_input.method === "claim") {
                await new ClaimDB({
                    address: get_tx.from.toLowerCase(),
                    to: get_tx.to.toLowerCase(),
                    buyer: decode_input.inputs[0].toLowerCase(),
                    amount: Number(web3.utils.hexToNumberString(decode_input.inputs[1])) / Math.pow(10, 18),
                    tx_id: get_tx.hash
                }).save()
                console.log(get_tx.hash)
            }
        } catch (error) {
            continue
        }

    }
    console.log(data_all_tx[data_all_tx.length - 1])
    console.log("done")

}

cloneClaim()