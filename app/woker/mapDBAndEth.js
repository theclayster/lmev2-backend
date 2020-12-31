const UniswapDB = require("../database/uniswap");
const dbConfig = require("../database/db_config");
const network_eth = require("../blockchain/network/eth");
const QUERY_TX = require("../query_subgraph/get_tx");
const requestPromise = require("request-promise");
const Platform = require("../platform/index");
const web3 = network_eth.get_lib_main_net();

const mongoose = require("mongoose");
// config mongo
mongoose.connect(dbConfig.dbs, {
  useNewUrlParser: true,
});

// config -----------------------------------
const TIME_STAMP_START = 1608430000;
const ADDRESS_POOL = "0x9081b50bad8beefac48cc616694c26b027c559bb";

async function mapCheckDbAndPool(address_pool) {
  get_all_db = await UniswapDB.find();
  for (let i = 0; i < get_all_db.length; i++) {
    try {
      get_tx_receipt = await web3.eth.getTransactionReceipt(
        get_all_db[i].tx_id
      );
    } catch (error) {
      console.log("update record id = ", get_all_db[i]._id);
      await UniswapDB.updateOne(
        { _id: get_all_db[i]._id },
        {
          $set: {
            status: "invalid",
          },
        }
      );
    }
  }

  get_all_tx_burn = await requestPromise.post(Platform.graphql_end_point, {
    json: {
      query: QUERY_TX.get_tx_burn_of_pool(address_pool, TIME_STAMP_START),
    },
  });

  for (let i = 0; i < get_all_tx_burn.data.burns.length; i++) {
    tx_hash = get_all_tx_burn.data.burns[i].id.substr(0, 66);
    data = await UniswapDB.findOne({ tx_id: tx_hash });

    if (!data) {
      get_tx_data = await web3.eth.getTransaction(tx_hash);
      result = await UniswapDB({
        type: "removeLiquidity",
        address: get_tx_data.from.toLowerCase(),
        amount: get_all_tx_burn.data.burns[i].liquidity,
        vault: "silver",
        tx_id: tx_hash,
      }).save();

      console.log("create record id " + result._id + "tx " + tx_hash);
    }else{
        console.log("tx " + tx_hash + " already exist")
    }
  }
}

mapCheckDbAndPool(ADDRESS_POOL);
