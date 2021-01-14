const UniswapDB = require("../database/uniswap");
const dbConfig = require("../database/db_config").db_connect_14_day;
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

async function report14day(address_pool) {
  console.log(
    "------------------------------run------------------------------"
  );

  time_now = Math.floor(Date.now() / 1000);

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
    "report_tx_14day_v1.json",
    JSON.stringify(total_after_rm),
    "utf8",
    function (err) {
      if (err) throw err;
      else console.log("Ghi file report_tx_14day_v1 thanh cong!");
    }
  );
  fs.writeFile(
    "report_tx_14day_v2.json",
    JSON.stringify(object),
    "utf8",
    function (err) {
      if (err) throw err;
      else console.log("Ghi file report_tx_14day_v2 thanh cong!");
    }
  );
}

report14day(ADDRESS_POOL);
