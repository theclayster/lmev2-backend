const InputDataDecoder = require("ethereum-input-data-decoder");
abi = require("./app/blockchain/abi/test.json")
const eth_network = require("./app/blockchain/network/eth")
const decoder = new InputDataDecoder(abi)
const OraiEnventDB = require("./app/database/orai_event");
const Web3 = require('web3');

const mongoose = require("mongoose");
const dbConfig = require("./app/database/db_config");
// config mongo
mongoose.connect(dbConfig.dbs, {
    useNewUrlParser: true,
});
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/f19c5e0f2fd047e9bc14b5fdd5577e5b"))
web3_socket = new Web3(new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws/v3/f19c5e0f2fd047e9bc14b5fdd5577e5b"))

async function test() {
    tuan =  await web3.utils.sha3('addLiquidityETH')
    tx = await web3.eth.getTransactionReceipt("0x8d980707e83078c5fcb494836d05e41a2a8fe822316ec8fbcb71d61330479ff5")
     
    console.log("dady la ",JSON.stringify(tx));
}
test()
// const txInput = "0xe8e3370000000000000000000000000036f3fd68e7325a35eb768f1aedaae9ea0689d723000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000229cf7af14feea0000000000000000000000000000000000000000000000000000000000002afd457e50000000000000000000000000000000000000000000002270a9a53f217ac000000000000000000000000000000000000000000000000000000000002ac63ebef0000000000000000000000006d1dc634d20268649e1eb6b207960fbc76e57dd7000000000000000000000000000000000000000000000000000000005fdce627";
// const result = decoder.decodeData(txInput);
// console.log(JSON.stringify(result));
// console.log(parseInt(result.inputs[1]));

// // const data = web3.eth.abi.decodeParameters(['address[]'], result.data);

// // { topics: [web3.utils.sha3('RegisterHash(address, uint256, string)')] }
// test = web3.utils.hexToNumber('0x0000000000000000000000000000000000000000000000000000000000000000');
// console.log(typeof (0));


// async function Test(address) {
//     socketInstance = new web3_socket.eth.Contract(abi, address);
//     socketInstance.events.AddLiquidity(async (err, events) => {
//         if (err) {
//             console.log(err);
//         }
//         if (events) {
//             console.log("day la events ", events);
//             // tx_hash = events.transactionHash
//             // var data = await web3.eth.getTransaction(tx_hash);
//             // console.log("day la data", data);
//         }
//     })

// }

// Test("0xdac17f958d2ee523a2206206994597c13d831ec7")
