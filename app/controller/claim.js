const {validationResult, check, query} = require("express-validator");
const abiDecoder = require('abi-decoder');
const ClaimDB = require("../database/claim");
const network_eth = require("../blockchain/network/eth");
const web3 = network_eth.get_lib_main_net();
const requestPromise = require("request-promise");


const ABI = require("../woker/worker_config/ABI");
const InputDataDecoder = require("ethereum-input-data-decoder");
const decoder = new InputDataDecoder(ABI.Reward_Contract.ABI);


module.exports = {
    get_lme_claim: async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let error = errors.errors;
            return res.status(200).send({status: 500, error});
        }
        account = req.params.account
        console.log(account)
        get_all_claim = await ClaimDB.find({
            address: account.toLowerCase()
        })

        get_all_tx = await requestPromise.get("https://api.etherscan.io/api?module=account&action=txlist&address=0x3d5c50f93c6b307de88b4c63212cca746673278f&startblock=11945435&endblock=99999999&sort=asc&apikey=PJZTHQZRS1MTRUHTUHVHVYKBYX1RQVGPXP");
        data_all_tx = JSON.parse(get_all_tx).result
        for (let i = 0; i < data_all_tx.length; i++) {
            if (data_all_tx[i].from.toLowerCase() == account.toLowerCase()) {
                get_tx = await web3.eth.getTransaction(data_all_tx[i].hash)
                decode_input = await decoder.decodeData(get_tx.input);
                if (typeof decode_input != "undefined" && decode_input.method === "claim") {
                    get_all_claim.push({
                        address: get_tx.from.toLowerCase(),
                        to: get_tx.to.toLowerCase(),
                        buyer: decode_input.inputs[0].toLowerCase(),
                        amount: Number(web3.utils.hexToNumberString(decode_input.inputs[1])) / Math.pow(10, 18),
                        tx_id: get_tx.hash
                    })

                }
            }

        }


        total_platinum = 0
        total_gold = 0
        total_silver = 0
        total_bronze = 0

        txs_platinum = []
        txs_gold = []
        txs_silver = []
        txs_bronze = []

        for (let i = 0; i < get_all_claim.length; i++) {

            if (get_all_claim[i].buyer.toLowerCase() == "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb2") {
                total_platinum += Number(get_all_claim[i].amount)
                txs_platinum.push(get_all_claim[i].tx_id)
                continue
            }
            if (get_all_claim[i].buyer == "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb3") {
                total_gold += Number(get_all_claim[i].amount)
                txs_gold.push(get_all_claim[i].tx_id)
                continue
            }
            if (get_all_claim[i].buyer == "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb4") {
                total_silver += Number(get_all_claim[i].amount)
                txs_silver.push(get_all_claim[i].tx_id)
                continue
            }
            if (get_all_claim[i].buyer == "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb5") {
                total_bronze += Number(get_all_claim[i].amount)
                txs_bronze.push(get_all_claim[i].tx_id)
                continue
            }
        }

        items = {
            platinum: {
                amount: total_platinum,
                txs: txs_platinum
            },
            gold: {
                amount: total_gold,
                txs: txs_gold
            },
            silver: {
                amount: total_silver,
                txs: txs_silver
            },
            bronze: {
                amount: total_bronze,
                txs: txs_bronze
            }
        }
        return res.status(200).send({status: 200, items});


    }
}

