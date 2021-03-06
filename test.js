// const InputDataDecoder = require("ethereum-input-data-decoder");
abi = require("./app/blockchain/abi/test.json");
const eth_network = require("./app/blockchain/network/eth");
// const decoder = new InputDataDecoder(abi);
const OraiEnventDB = require("./app/database/transacion_lock");
const Web3 = require("web3");
const UniswapDB = require("./app/database/uniswap");
const ClaimDb = require("./app/database/claim");
const mongoose = require("mongoose");
const dbConfig = require("./app/database/db_config");
const LockRewardDB = require("./app/database/lock_reward");
// config mongo
mongoose.connect(dbConfig.dbs, {
    useNewUrlParser: true,
});

const ABI = require("./app/woker/worker_config/ABI");
const InputDataDecoder = require("ethereum-input-data-decoder");
const decoder = new InputDataDecoder(ABI.Reward_Contract.ABI);


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
    tx = await web3.eth.getTransactionReceipt("0XAfC5582AFA457FC333327EABB992E1343B280A43EAD19B5FF134E2DAC8D8A45F")
    // get_tx = await web3.eth.getTransaction("0xcfbfeb861c8931b7593c5dd730238d2724bf892f3a0d3f4484ed14b0aa832d1e")
    // decode_input = await decoder.decodeData(get_tx.input);
    // console.log(decode_input)
    // tuan = await UniswapDB.find({
    //     tx_id: "0XAFC5582AFA457FC333327EABB992E1343B280A43EAD19B5FF134E2DAC8D8A45F"
    //     // address: "0x9a921a5ef58512402c55de2996e7924851ac4ddd",
    // });

    // // tuan = await LockRewardDB.findById("5ff5a605fb171d1d1623e1c8");

    console.log("dady la ", "0XAFC5582AFA457FC333327EABB992E1343B280A43EAD19B5FF134E2DAC8D8A45F".toLowerCase());

    // a = (513.934 * 2 * 250 * 30) / (365 * 100 * 1)
    // b = (976.475 * 2 * 250 * 30) / (365 * 100 * 1)
    // c = (925.082513396191407671 * 2 * 250 * 30) / (365 * 100 * 1)
    // e = ((975.203 * 2 * 175 * 14) / (365 * 100 * 1)) * 4
    // f = (973.404 * 2 * 250 * 30) / (365 * 100 * 1)
    //
    // g = (489.455344892497147653 * 2 * 250 * 30) / (365 * 100 * 1)
    // console.log(a + b + c  + f)
    // console.log(e)
    // console.log(g)
}

// a = 0.0006207176782038193
// b = (a*2*175*14)/(365*100*7)
// console.log(b);
test();
// var unixTimestamp = new Date((1611280800) * 1000);
// console.log(unixTimestamp);

// console.log(Date.parse(unixTimestamp)/1000);

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

// const async = require("async");
// function a(err, done) {
//   async.auto(
//     {
//       createRawAndSend: (next) => {
//         return next(null, "trong");
//       },
//     },
//     (err, ret) => {
//       if (err) {
//         logger.error("ERR send raw transaction club!!", err);
//         return done(err.message);
//       } else {
//         const data = ret.createRawAndSend;
//         console.log(data);
//         return done(null, data);
//       }
//     }
//   );
// }

// function b() {
//   a(null, function (err, done) {
//     console.log("ddd", done);
//   });
// }
// b();
