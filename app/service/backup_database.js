const PATH = require("../commom/path").path;
const UniswapDB = require("../database/uniswap");
const fs = require("fs").promises;
var path = require("path");
const appDir = path.dirname(require.main.filename);

module.exports = {
  backup_database: async () => {
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

      await fs.writeFile(
        `${appDir}/${PATH.backup_db}/${time_file}.json`,
        JSON.stringify(data_mongo)
      );
      return true;
    } catch (error) {
      return false;
    }
  },
};
