const UniswapDB = require("../database/uniswap");
const dbConfig = require("../database/db_config").db_14_day;
const QUERY_TX = require("../query_subgraph/get_tx");
const requestPromise = require("request-promise");
const Platform = require("../platform/index");
var fs = require("fs");
const eth_network = require("../blockchain/network/eth");
const web3 = eth_network.get_lib_main_net();
const mongoose = require("mongoose");
// config mongo
mongoose.connect(dbConfig, {
  useNewUrlParser: true,
});

// config -----------------------------------
const ADDRESS_POOL = "0x9081b50bad8beefac48cc616694c26b027c559bb";
const TIME_APPROXX = 1209600; // 14 ngay
const TIME_STAMP_START = 1609354256; // thứ năm, 31 tháng 12 năm 2020 01:50:56

async function report14day(address_pool) {
  time_now = Math.floor(Date.now() / 1000);

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
  fs.appendFile(
    `./backupdb/` + process.argv[2] + time_now + `.json`,
    JSON.stringify({
      data_mongo,
    }),
    "utf8",
    function (err) {
      if (err) throw err;
      else console.log("Ghi file backup database thanh cong!");
    }
  );

  console.log(
    "----------------------------run filter tx drop----------------------------"
  );

  tx_drop = [];
  for (let i = 0; i < get_all_tx.length; i++) {
    try {
      get_tx_receipt = await web3.eth.getTransactionReceipt(
        get_all_tx[i].tx_id
      );
      if (!get_tx_receipt) {
        tx_drop.push(get_all_tx[i].tx_id);
        await UniswapDB.deleteOne({ tx_id: get_all_tx[i].tx_id });
        console.log("Tx drop ", get_all_tx[i].tx_id);
      }
    } catch (error) {
      tx_drop.push(get_all_tx[i].tx_id);
      await UniswapDB.deleteOne({ tx_id: get_all_tx[i].tx_id });
      console.log("Tx drop ", get_all_tx[i].tx_id);
    }
  }

  fs.writeFile(
    "./report14day/report_tx_not_exists_on_network.json",
    JSON.stringify(tx_drop),
    "utf8",
    function (err) {
      if (err) throw err;
      else console.log("Ghi file report_tx_not_exists_on_network thanh cong!");
    }
  );

  console.log(
    "----------------------------run check tx rm on uniswap not exists----------------------------"
  );

  get_all_tx_burn = await requestPromise.post(Platform.graphql_end_point, {
    json: {
      query: QUERY_TX.get_tx_burn_of_pool(address_pool, TIME_STAMP_START),
    },
  });

  list_tx_omitted = [];

  for (let i = 0; i < get_all_tx_burn.data.burns.length; i++) {
    console.log(i);
    tx_hash = get_all_tx_burn.data.burns[i].id.substr(0, 66);
    data = await UniswapDB.findOne({ tx_id: tx_hash });

    if (data != null) {
      get_tx_data = await web3.eth.getTransaction(tx_hash);

      data_tx_omitted = {
        type: "removeLiquidity",
        amount: get_all_tx_burn.data.burns[i].amount0,
        tx_id: tx_hash,
        address: get_tx_data.from.toLowerCase(),
        createAt: Math.floor(
          get_all_tx_burn.data.burns[i].transaction.timestamp / 1000
        ),
        updateAt: Math.floor(
          get_all_tx_burn.data.burns[i].transaction.timestamp / 1000
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
        "day la tx sot " + tx_hash + " insert database _id = " + insertDb._id
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

  console.log("----------------------------run------------------------------");

  time_before = new Date((time_now - TIME_APPROXX) * 1000);

  // lấy tx addLp trong db có thời gian là 14 day
  get_tx_addLp = await UniswapDB.find({
    type: "addLiquidity",
    vault: "gold",
    createAt: {
      $lt: time_before,
    },
  });

  list_account = [];
  // get account
  for (let i = 0; i < get_tx_addLp.length; i++) {
    if (!list_account.includes(get_tx_addLp[i].address)) {
      list_account.push(get_tx_addLp[i].address);
    }
  }

  //tinh tổng addLp của từng account
  total_add_of_account = [];

  for (let i = 0; i < list_account.length; i++) {
    amount = 0;
    for (let j = 0; j < get_tx_addLp.length; j++) {
      amount_orai = 0;
      if (list_account[i] == get_tx_addLp[j].address) {
        get_tx_receipt = await web3.eth.getTransactionReceipt(
          get_tx_addLp[j].tx_id
        );

        amount_orai = await web3.utils.hexToNumberString(
          get_tx_receipt.logs[0].data
        );

        amount += Number(amount_orai);
      }
    }

    total_add_of_account.push({
      address: list_account[i],
      amount: amount / Math.pow(10, 18),
    });
  }

  // get tx remove last -> now
  get_tx_rmLp = await UniswapDB.find({
    type: "removeLiquidity",
    vault: "gold",
  });

  total_after_rm = [];
  list_address = [];
  reward_amound = [];

  for (let i = 0; i < total_add_of_account.length; i++) {
    amount = total_add_of_account[i].amount;
    for (let j = 0; j < get_tx_rmLp.length; j++) {
      if (total_add_of_account[i].address == get_tx_rmLp[j].address) {
        get_tx_receipt = await web3.eth.getTransactionReceipt(
          get_tx_rmLp[j].tx_id
        );

        amount_orai_rm_lp = await web3.utils.hexToNumberString(
          get_tx_receipt.logs[3].data
        );

        amount -= Number(amount_orai_rm_lp) / Math.pow(10, 18);
      }
    }

    if (amount > 0.1) {
      amount_percent = (amount * 2 * 175 * 14) / (365 * 100 * 7);
      list_address.push(total_add_of_account[i].address);
      reward_amound.push(Math.round(amount_percent * 1000) / 1000);
      total_after_rm.push({
        address: total_add_of_account[i].address,
        amount: amount,
        reward_amound: amount_percent,
      });
    }
  }

  object = {
    list_address,
    reward_amound,
  };

  fs.writeFile(
    "./report14day/report_tx_14day_v1.json",
    JSON.stringify(total_after_rm),
    "utf8",
    function (err) {
      if (err) throw err;
      else console.log("Ghi file report_tx_14day_v1 thanh cong!");
    }
  );
  fs.writeFile(
    "./report14day/report_tx_14day_v2.json",
    JSON.stringify(object),
    "utf8",
    function (err) {
      if (err) throw err;
      else console.log("Ghi file report_tx_14day_v2 thanh cong!");
    }
  );
}

report14day(ADDRESS_POOL);
