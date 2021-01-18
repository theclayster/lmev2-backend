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
const TIME_STAMP_START = 1609354256; // thứ năm, 31 tháng 12 năm 2020 01:50:56
const VAULT = "gold";
const TIME_CHANGE_PERCENT = 1610762400;

async function report14day(address_pool) {
  time_now = Math.floor(Date.now() / 1000);

  APY = 0;
  TIME_APPROXX = 0;
  TOTAL_DAY = 0;
  if (VAULT == "platinum") {
    TOTAL_DAY = 30;
    TIME_APPROXX = 2592000; // 30 day
    APY = 70;
  } else if (VAULT == "gold") {
    TOTAL_DAY = 14;
    TIME_APPROXX = 1209600; // 14 day
    APY = 50;
  } else if (VAULT == "silver") {
    TOTAL_DAY = 7;
    TIME_APPROXX = 604800; // 7 day
    APY = 35;
  } else if (VAULT == "bronze") {
    TOTAL_DAY = 3;
    TIME_APPROXX = 259200; // 3 day
    APY = 25;
  } else {
    console.log("You need config VAULT at line 19");
    return;
  }

  check_and_clean_db = await check_database();
  if (check_and_clean_db != true) {
    console.log(
      "----------------------------check and backup error----------------------------"
    );
    return;
  }

  console.log("Run reward");
  // Công thức trừ time tịnh tiến như thế này.
  // Timenow - time_APProxx của từng loại đồng  = time_before
  // Sau đó tịnh tiến 7 ngày leien tiêp thì time_before sẽ trừ tiếp đi 7 ngày nữa
  //   lấy toàn bộ tx add  từ 16/01/2021 2h00 AM UTC+7 ->now
  time_before = new Date((time_now - TIME_APPROXX) * 1000);
  time_7day_before = new Date((time_now - TIME_APPROXX - 604800) * 1000);

  get_tx_addLp = [];
  if (TIME_CHANGE_PERCENT >= Date.parse(time_7day_before) / 1000) {
    time_7day_before = new Date(TIME_CHANGE_PERCENT * 1000);
  }

  // lấy tx addLp trong db có thời gian là 14 day
  get_tx_addLp = await UniswapDB.find({
    type: "addLiquidity",
    vault: VAULT,
    createAt: {
      $gte: time_7day_before,
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
  time_now_convert = new Date(time_now * 1000);
  get_tx_rmLp = await UniswapDB.find({
    type: "removeLiquidity",
    vault: VAULT,
    createAt: {
      $gte: time_7day_before,
      $lt: time_now_convert,
    },
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
      amount_percent = (amount * 2 * APY * TOTAL_DAY) / (365 * 100 * 7);
      list_address.push(total_add_of_account[i].address);
      reward_amound.push(Math.round(amount_percent * 1000) / 1000);
      total_after_rm.push({
        address: total_add_of_account[i].address,
        amount: amount,
        reward_amound: amount_percent,
      });
    }
  }

  // ---------------------------hàm check tx last ->16/01/2021 2h00 AM UTC+7
  time_22_stamp = 1611280800;
  if (time_22_stamp > time_now) {
    get_result_before_16 = await get_tx_before_16(time_22_stamp);
    list_address.concat(get_result_before_16.list_address);
    reward_amound.concat(get_result_before_16.reward_amound);
    total_after_rm.concat(get_result_before_16.total_after_rm);
  }
  //   --------------------------------------------------------------------
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

async function get_tx_before_16(time_22_stamp) {
  get_tx_addLp = await UniswapDB.find({
    type: "addLiquidity",
    vault: VAULT,
    createAt: {
      $lt: new Date(time_22_stamp * 1000),
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
  time_now_convert = new Date(time_now * 1000);
  get_tx_rmLp = await UniswapDB.find({
    type: "removeLiquidity",
    vault: VAULT,
    createAt: {
      $lt: time_now_convert,
    },
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
  result = {
    list_address,
    reward_amound,
    total_after_rm,
  };
  return result;
}

async function check_database() {
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
      else console.log("Ghi file report_tx_not_exists_on_network thanh cong!");
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
}

report14day(ADDRESS_POOL);
