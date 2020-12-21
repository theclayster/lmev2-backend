const InputDataDecoder = require('ethereum-input-data-decoder');
const axios = require('axios');
const lock1 = require('../blockchain/abi/lock1.json')
const TransacionLockDB = require("../database/transacion_lock");
const network_eth = require("../blockchain/network/eth")
const mongoose = require("mongoose");
const dbConfig = require("../database/db_config");

// init decode
const decoder = new InputDataDecoder(lock1);

// config mongo
mongoose.connect(dbConfig.dbs, {
    useNewUrlParser: true,
});

// address Lock
ADDRESS_LOCK = ["0x17e00383a843a9922bca3b280c0ade9f8ba48449"]

async function getAllTransaction(ADDRESS_LOCK) {
    for (let i = 0; i < ADDRESS_LOCK.length; i++) {
        insert_database(ADDRESS_LOCK[i])
    }

}

async function insert_database(address_lock) {
    axios.get("https://api.etherscan.io/api?module=account&action=txlist&address=" +
        address_lock + "&startblock=" + 10503172 + "&endblock=99999999&sort=asc&apikey=PJZTHQZRS1MTRUHTUHVHVYKBYX1RQVGPXP")
        .then(async function (response) {
            data = response.data.result
            for (let i = 0; i < data.length; i++) {

                try {
                    console.log(data[i].blockNumber);
                    inputData = data[i].input;
                    decodeData = decoder.decodeData(inputData);
                    let dataInsert = {
                        "block_number": data[i].blockNumber,
                        "from": data[i].from.toLowerCase(),
                        "to": data[i].to.toLowerCase(),
                        "hash": data[i].hash,
                        "address_pool": "0x" + decodeData.inputs[0].toLowerCase(),
                        "amount": parseInt(decodeData.inputs[1]),
                        "unlock_date": parseInt(decodeData.inputs[2])
                    }
                    await new TransacionLockDB(dataInsert).save()
                } catch (error) {
                    continue
                }
            }
            console.log("Listen address lock ", address_lock);
            network_eth.get_lib_main_net_socket().eth.subscribe('logs', {
                address: address_lock,
            }, async function (err, result) {

            })

        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

getAllTransaction(ADDRESS_LOCK)