const PATH = require("../commom/path").path;
const UniswapDB = require("../database/uniswap");
const fs = require("fs").promises;
var path = require("path");
const appDir = path.dirname(require.main.filename);
const QUERY_TX = require("../query_subgraph/get_tx");
const Platform = require("../platform/index");
const requestPromise = require("request-promise");
const eth_network = require("../blockchain/network/eth");
const web3 = eth_network.get_lib_main_net();
require("dotenv").config();

module.exports = {
  check_tx_rm_omitted: async () => {
    try {
      get_all_tx_burn = await requestPromise.post(Platform.graphql_end_point, {
        json: {
          query: QUERY_TX.get_tx_burn_of_pool(
            process.env.ADDRESS_POOL,
            process.env.TIME_STAMP_START
          ),
        },
      });

      list_tx_omitted = [];
      for (let i = 0; i < get_all_tx_burn.data.burns.length; i++) {
        console.log("check tx remove omitted", i);
        tx_hash = get_all_tx_burn.data.burns[i].id.substr(0, 66);
        data = await UniswapDB.findOne({ tx_id: tx_hash });

        if (data == null) {
          get_tx_data = await web3.eth.getTransaction(tx_hash);

          data_tx_omitted = {
            type: "removeLiquidity",
            amount: get_all_tx_burn.data.burns[i].liquidity,
            tx_id: tx_hash,
            address: get_tx_data.from.toLowerCase(),
            createAt: new Date(
              get_all_tx_burn.data.burns[i].transaction.timestamp * 1000
            ),
            updateAt: new Date(
              get_all_tx_burn.data.burns[i].transaction.timestamp * 1000
            ),
          };

          get_account = await UniswapDB.findOne({
            address: get_tx_data.from.toLowerCase(),
          });

          if (get_account) {
            data_tx_omitted.vault = get_account.vault;
          }

          list_tx_omitted.push(data_tx_omitted);

          insertDb = await UniswapDB.findOneAndUpdate(
            { tx_id: tx_hash },
            data_tx_omitted,
            {
              new: true,
              upsert: true,
            }
          );

          console.log(
            "This is tx remove not exist in database " +
              tx_hash +
              " insert database have _id = " +
              insertDb._id
          );
        }
      }
      time_now = Math.floor(Date.now() / 1000);
      var unixTimestamp = new Date(time_now * 1000);
      time_file =
        unixTimestamp.getDate().toString() +
        "_" +
        (unixTimestamp.getMonth() + 1).toString() +
        "_" +
        unixTimestamp.getFullYear().toString() +
        "_" +
        unixTimestamp.getHours().toString() +
        "h_" +
        unixTimestamp.getMinutes().toString() +
        "m_" +
        unixTimestamp.getSeconds().toString() +
        "s";

      await fs.writeFile(
        `${appDir}/${PATH.tx_omitted}/${time_file}.json`,
        JSON.stringify(list_tx_omitted)
      );

      return true;
    } catch (error) {
      return false;
    }
  },
};
