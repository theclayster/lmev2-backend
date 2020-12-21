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
    // tuan =  await web3.utils.sha3('addLiquidityETH')
    // tx = await web3.eth.getTransactionReceipt("0x8d980707e83078c5fcb494836d05e41a2a8fe822316ec8fbcb71d61330479ff5")
    tuan = await OraiEnventDB.find({'addres_pool':"0x9081b50bad8beefac48cc616694c26b027c559bb"})
    
    console.log("dady la ",JSON.stringify(tuan));
}
test()
// const txInput = "0xded9382a0000000000000000000000004c11249814f11b9346808179cf06e71ac328c1b5000000000000000000000000000000000000000000000000078f8ac68a633feb00000000000000000000000000000000000000000000000052f321f5a0ca647700000000000000000000000000000000000000000000000001649bf18ddb125600000000000000000000000023d7323111bf9ddb476fc7e47e7da042cce79129000000000000000000000000000000000000000000000000000000005fdeb6e90000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001b03e19a3f410e33013e4bd4f467106f237aee34548386faed8e8f00f7a5f8c9195fde4efc13c4ffec51323f5ef70533a49028bbc123294d5d64c78d9137e6fc56";
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
