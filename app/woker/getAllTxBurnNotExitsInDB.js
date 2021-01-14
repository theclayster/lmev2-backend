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

async function getAllTxBurnNotExitsInDB(address_pool) {
  data_result = [];
  get_all_tx_burn = await requestPromise.post(Platform.graphql_end_point, {
    json: {
      query: QUERY_TX.get_tx_burn_of_pool(address_pool, TIME_STAMP_START),
    },
  });

  for (let i = 0; i < get_all_tx_burn.data.burns.length; i++) {
    tx_hash = get_all_tx_burn.data.burns[i].id.substr(0, 66);
    data = await UniswapDB.findOne({ tx_id: tx_hash });
    total = 0;

    if (!data) {
      get_tx_data = await web3.eth.getTransaction(tx_hash);
      get_account = await UniswapDB.find({
        address: get_tx_data.from.toLowerCase(),
      });

      if (get_account) {
        for (let i = 0; i < get_account.length; i++) {
          if (get_account[i].type == "addLiquidity") {
            total += Number(get_account[i].amount);
          }
          if (get_account[i].type == "removeLiquidity") {
            total -= Number(get_account[i].amount);
          }
        }
        if (total <= Number(get_all_tx_burn.data.burns[i].liquidity)) {
          data_result.push({
            type: "removeLiquidity",
            address: get_tx_data.from.toLowerCase(),
            amount: get_all_tx_burn.data.burns[i].liquidity,
            vault: "platinum",
            tx_id: tx_hash,
            status: 1,
            msg:
              "Tx remove co tren mang nhung khong co trong db va co tong tx add trong db lon hon gia tri  remove cua tx nay",
            createAt: new Date(
              get_all_tx_burn.data.burns[i].transaction.timestamp * 1000
            ),
            updateAt: new Date(
              get_all_tx_burn.data.burns[i].transaction.timestamp * 1000
            ),
          });
        } else {
          data_result.push({
            type: "removeLiquidity",
            address: get_tx_data.from.toLowerCase(),
            amount: get_all_tx_burn.data.burns[i].liquidity,
            vault: "platinum",
            tx_id: tx_hash,
            status: 2,
            createAt: new Date(
              get_all_tx_burn.data.burns[i].transaction.timestamp * 1000
            ),
            updateAt: new Date(
              get_all_tx_burn.data.burns[i].transaction.timestamp * 1000
            ),
            msg:
              "Tx remove co tren mang nhung khong co trong db va co tong  add trong db nho hon gia tri  remove cua tx nay",
          });
        }
      } else {
        data_result.push({
          type: "removeLiquidity",
          address: get_tx_data.from.toLowerCase(),
          amount: get_all_tx_burn.data.burns[i].liquidity,
          vault: "platinum",
          tx_id: tx_hash,
          status: 3,
          createAt: new Date(
            get_all_tx_burn.data.burns[i].transaction.timestamp * 1000
          ),
          updateAt: new Date(
            get_all_tx_burn.data.burns[i].transaction.timestamp * 1000
          ),
          msg:
            "Tx remove co tren mang nhung khong co trong db va khong co bat ki giao dich nao trong db",
        });
      }
    } else {
      console.log("tx " + tx_hash + " already exist");
    }
    
  }

  fs.writeFile("tx.json", JSON.stringify(data_result), "utf8", function (err) {
    if (err) throw err;
    else console.log("Ghi file thanh cong!");
  });


}

getAllTxBurnNotExitsInDB(ADDRESS_POOL);
