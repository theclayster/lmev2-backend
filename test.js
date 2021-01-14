const InputDataDecoder = require("ethereum-input-data-decoder");
abi = require("./app/blockchain/abi/test.json");
const eth_network = require("./app/blockchain/network/eth");
const decoder = new InputDataDecoder(abi);
const OraiEnventDB = require("./app/database/transacion_lock");
const Web3 = require("web3");
const UniswapDB = require("./app/database/uniswap");
const mongoose = require("mongoose");
const dbConfig = require("./app/database/db_config");
// config mongo
mongoose.connect(dbConfig.dbs, {
  useNewUrlParser: true,
});
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://mainnet.infura.io/v3/f19c5e0f2fd047e9bc14b5fdd5577e5b"
  )
);
web3_socket = new Web3(
  new Web3.providers.WebsocketProvider(
    "wss://mainnet.infura.io/ws/v3/f19c5e0f2fd047e9bc14b5fdd5577e5b"
  )
);

async function test() {
//   tuan =  await web3.utils.sha3('addLiquidityETH')
//   tx = await web3.eth.getTransactionReceipt("0x8186f263aa82bf94836f6ecf2203f5101748e72e12b1120cd971f73613e4a0a1")
  tuan = await UniswapDB.find({
    tx_id: "0x100ab2869257808abf5e8bec927abe8e7f275670b727f4a7c4b9c6fe368dd12f",
  });

  console.log("dady la ", JSON.stringify(tuan));
}
a = 0.0006207176782038193
b = (a*2*175*14)/(365*100*7)
console.log(b);
// test()
// tuan = Math.round(new Date("2020-12-30T19:56:11.742+00:00") / 1000);
// // /1609354258
// console.log(tuan);
// const fastcsv = require('fast-csv');
// const fs = require('fs');
// const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// const csvWriter = createCsvWriter({
//   path: "out.csv",
//   header: [
//     { id: "name", title: "Name" },
//     { id: "surname", title: "Surname" },
//     { id: "age", title: "Age" },
//     { id: "gender", title: "Gender" },
//   ],
// });

// const data = [{
//   name: "John",
//   surname: "Snow",
//   age: 26,
//   gender: "M",
// }];

// csvWriter
//   .writeRecords(data)
//   .then(() => console.log("The CSV file was written successfully"));

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
