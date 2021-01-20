const PATH = require("../commom/path").path;
const UniswapDB = require("../database/uniswap");
const fs = require("fs").promises;
var path = require("path");
const appDir = path.dirname(require.main.filename);
const eth_network = require("../blockchain/network/eth");
const web3 = eth_network.get_lib_main_net();
const async = require("async");

module.exports = {
  check_tx_error: async () => {
    try {
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

      get_all_tx = await UniswapDB.find();
      var tx_drop = [];
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
      await fs.writeFile(
        `${appDir}/${PATH.tx_error}/${time_file}.json`,
        JSON.stringify(tx_drop)
      );
      return true;
      // length_array = get_all_tx.length;
      // result = false;
      // async.auto(
      //   {
      //     check_tx_error_1: async (callback) => {
      //       for (let i = 0; i < length_array / 2; i++) {
      //         try {
      //           console.log("check record number on network eth = ", i);
      //           get_tx_receipt = await web3.eth.getTransactionReceipt(
      //             get_all_tx[i].tx_id
      //           );
      //           if (!get_tx_receipt) {
      //             tx_drop.push(get_all_tx[i].tx_id);
      //             await UniswapDB.deleteOne({ tx_id: get_all_tx[i].tx_id });
      //             console.log("Tx has been drop on network", get_all_tx[i].tx_id);
      //           }
      //         } catch (error) {
      //           tx_drop.push(get_all_tx[i].tx_id);
      //           await UniswapDB.deleteOne({ tx_id: get_all_tx[i].tx_id });
      //           console.log("Tx has been drop on network ", get_all_tx[i].tx_id);
      //         }
      //       }
      //     },
      //     check_tx_error_2: async (callback) => {
      //       for (let i = length_array / 2; i < length_array; i++) {
      //         try {
      //           console.log("check record number on network eth = ", i);
      //           get_tx_receipt = await web3.eth.getTransactionReceipt(
      //             get_all_tx[i].tx_id
      //           );
      //           if (!get_tx_receipt) {
      //             tx_drop.push(get_all_tx[i].tx_id);
      //             await UniswapDB.deleteOne({ tx_id: get_all_tx[i].tx_id });
      //             console.log("Tx has been drop on network", get_all_tx[i].tx_id);
      //           }
      //         } catch (error) {
      //           tx_drop.push(get_all_tx[i].tx_id);
      //           await UniswapDB.deleteOne({ tx_id: get_all_tx[i].tx_id });
      //           console.log("Tx has been drop on network ", get_all_tx[i].tx_id);
      //         }
      //       }
      //     },
      //   },
      //   async () => {
      //     await fs.writeFile(
      //       `${appDir}/${PATH.tx_error}.json`,
      //       JSON.stringify(tx_drop)
      //     );
      //   }
      // );
    } catch (error) {
      return false;
    }
  },
};
