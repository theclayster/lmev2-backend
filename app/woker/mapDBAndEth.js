const UniswapDB = require("../database/uniswap");
const dbConfig = require("../database/db_config");
const network_eth = require("../blockchain/network/eth");
const QUERY_TX = require("../query_subgraph/get_tx");
const requestPromise = require("request-promise");
const Platform = require("../platform/index");
const web3 = network_eth.get_lib_main_net();
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
var fs = require("fs");

const mongoose = require("mongoose");
// config mongo
mongoose.connect(dbConfig.dbs, {
  useNewUrlParser: true,
});

// config -----------------------------------
const TIME_STAMP_START = 1609354256;
const ADDRESS_POOL = "0x9081b50bad8beefac48cc616694c26b027c559bb";

async function mapCheckDbAndPool(address_pool) {
  const csvWriter = createCsvWriter({
    path: "report.csv",
    header: [
      { id: "tx_id", title: "tx_id" },
      { id: "method_db", title: "method_db" },
      { id: "value_db", title: "value_db" },
      { id: "value_network", title: "value_network" },
      { id: "status", title: "status" },
    ],
  });

  var data_result = [];
  var tx_not_exists_on_network = [];
  var totalLpDb = 0;
  get_all_db = await UniswapDB.find();
  for (let i = 0; i < get_all_db.length; i++) {
    try {
      if (get_all_db[i].type == "addLiquidity") {
        totalLpDb += Number(get_all_db[i].amount);
      }
      if (get_all_db[i].type == "removeLiquidity") {
        totalLpDb -= Number(get_all_db[i].amount);
      }

      // kiem tra ton tai db
      get_tx_receipt = await web3.eth.getTransactionReceipt(
        get_all_db[i].tx_id
      );
      if (get_all_db[i].type == "addLiquidity") {
        data_result.push({
          tx_id: get_all_db[i].tx_id,
          method_db: get_all_db[i].type,
          value_db: get_all_db[i].amount,
          value_network: web3.utils.hexToNumberString(
            get_tx_receipt.logs[3].data
          ),
          status: "tx_id exists in db and network",
        });
      } else {
        data_result.push({
          tx_id: get_all_db[i].tx_id,
          method_db: get_all_db[i].type,
          value_db: get_all_db[i].amount,
          value_network: web3.utils.hexToNumberString(
            get_tx_receipt.logs[2].data
          ),
          status: "tx_id exists in db and network",
        });
      }
    } catch (error) {
      // console.log(error);
      tx_not_exists_on_network.push(get_all_db[i].tx_id);
      data_result.push({
        tx_id: get_all_db[i].tx_id,
        method_db: get_all_db[i].type,
        value_db: get_all_db[i].amount,
        status: "tx_id not exists on network",
      });
      console.log("tx bi loi vi khong co tren eth", get_all_db[i].tx_id);
      // console.log("update record id = ", get_all_db[i]._id);
      // await UniswapDB.updateOne(
      //   { _id: get_all_db[i]._id },
      //   {
      //     $set: {
      //       status: "invalid",
      //     },
      //   }
      // );
    }
  }
  fs.writeFile("tx_not_exists_on_network.json", JSON.stringify(tx_not_exists_on_network), "utf8", function (err) {
    if (err) throw err;
    else console.log("Ghi file thanh cong!");
  });

  console.log("-------------totalLpDb", totalLpDb);

  total_burn = 0;
  get_all_tx_burn = await requestPromise.post(Platform.graphql_end_point, {
    json: {
      query: QUERY_TX.get_tx_burn_of_pool(address_pool, TIME_STAMP_START),
    },
  });

  for (let i = 0; i < get_all_tx_burn.data.burns.length; i++) {
    total_burn += Number(get_all_tx_burn.data.burns[i].liquidity);
    tx_hash = get_all_tx_burn.data.burns[i].id.substr(0, 66);
    data = await UniswapDB.findOne({ tx_id: tx_hash });

    if (!data) {
      console.log("day la tx sot ", tx_hash);
      get_tx_data = await web3.eth.getTransaction(tx_hash);

      data_result.push({
        tx_id: tx_hash,
        method_db: "removeLiquidity",
        value_network: web3.utils.hexToNumberString(
          get_tx_receipt.logs[2].data
        ),
        status: "tx_id not exist in database",
      });
      // result = await UniswapDB({
      //   type: "removeLiquidity",
      //   address: get_tx_data.from.toLowerCase(),
      //   amount: get_all_tx_burn.data.burns[i].liquidity,
      //   vault: "silver",
      //   tx_id: tx_hash,
      // }).save();

      // console.log("create record id " + result._id + "tx " + tx_hash);
    } else {
      console.log("tx " + tx_hash + " already exist");
    }
  }
  console.log("-------------total_burn", total_burn);

  total_mint = 0;
  get_all_tx_mints = await requestPromise.post(Platform.graphql_end_point, {
    json: {
      query: QUERY_TX.get_tx_mints_of_pool(address_pool, TIME_STAMP_START),
    },
  });

  for (let i = 0; i < get_all_tx_mints.data.mints.length; i++) {
    total_mint += Number(get_all_tx_mints.data.mints[i].liquidity);
  }

  console.log("-------------total_mint", total_mint);

  csvWriter
    .writeRecords(data_result)
    .then(() => console.log("The CSV file was written successfully"));
}

mapCheckDbAndPool(ADDRESS_POOL);
