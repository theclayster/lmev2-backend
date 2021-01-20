const UniswapDB = require("../../database/uniswap");
const QUERY_TX = require("../../query_subgraph/get_tx");
const requestPromise = require("request-promise");
const Platform = require("../../platform/index");
var fs = require("fs");
const eth_network = require("../../blockchain/network/eth");
const web3 = eth_network.get_lib_main_net();

module.exports = {
  backup_db: async () => {
    //   Bắt đầu backupdb
    get_all_tx = await UniswapDB.find();
    data_mongo = [];
    for (let i = 0; i < get_all_tx.length; i++) {
      data_mongo.push({
        _id: {
          $oid: get_all_tx[i]._id,
        },
        type: get_all_tx[i].type,
        address: get_all_tx[i].address,
        amount: get_all_tx[i].amount,
        vault: get_all_tx[i].vault,
        tx_id: get_all_tx[i].tx_id,
        createAt: {
          $date: get_all_tx[i].createAt,
        },
        updateAt: {
          $date: get_all_tx[i].updateAt,
        },
        __v: 0,
      });
    }
    console.log(
      "----------------------------BackUp database----------------------------"
    );

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

    fs.appendFile(
      `./backupdb/` + process.argv[2] + time_file + `.json`,
      JSON.stringify({
        data_mongo,
      }),
      "utf8",
      function (err) {
        if (err) throw err;
        else console.log("Ghi file backup database thanh cong!");
      }
    );

    //   ---------------------------------------------------

    console.log("run filter tx drop");
    tx_drop = [];
    for (let i = 0; i < get_all_tx.length; i++) {
      try {
        console.log("check record number on network eth = ", i);
        get_tx_receipt = await web3.eth.getTransactionReceipt(
          get_all_tx[i].tx_id
        );
        if (!get_tx_receipt) {
          tx_drop.push(get_all_tx[i].tx_id);
          await UniswapDB.deleteOne({ tx_id: get_all_tx[i].tx_id });
          console.log("Tx has been drop on network", get_all_tx[i].tx_id);
        }
      } catch (error) {
        tx_drop.push(get_all_tx[i].tx_id);
        await UniswapDB.deleteOne({ tx_id: get_all_tx[i].tx_id });
        console.log("Tx has been drop on network ", get_all_tx[i].tx_id);
      }
    }

    fs.writeFile(
      "./report14day/report_tx_not_exists_on_network.json",
      JSON.stringify(tx_drop),
      "utf8",
      function (err) {
        if (err) throw err;
        else
          console.log("Ghi file report_tx_not_exists_on_network thanh cong!");
      }
    );

    console.log(
      "----------------------------run check tx rm on uniswap not exists----------------------------"
    );

    get_all_tx_burn = await requestPromise.post(Platform.graphql_end_point, {
      json: {
        query: QUERY_TX.get_tx_burn_of_pool(ADDRESS_POOL, TIME_STAMP_START),
      },
    });

    list_tx_omitted = [];

    for (let i = 0; i < get_all_tx_burn.data.burns.length; i++) {
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

    fs.writeFile(
      "./report14day/report_tx_omitted.json",
      JSON.stringify(list_tx_omitted),
      "utf8",
      function (err) {
        if (err) throw err;
        else console.log("Ghi file report_tx_omitted thanh cong!");
      }
    );
    return true;
  },
};
