const UniswapDB = require("../database/uniswap");
const dbConfig = "mongodb://127.0.0.1:27017/orai";
var fs = require("fs");

const mongoose = require("mongoose");
// config mongo
mongoose.connect(dbConfig, {
  useNewUrlParser: true,
});

// config -----------------------------------
const ADDRESS_POOL = "0x9081b50bad8beefac48cc616694c26b027c559bb";
const TIME_APPROXX = 1209600; // 14 ngay

async function report14day(address_pool) {
  time_now = Math.floor(Date.now() / 1000);

  time_before = new Date((time_now - TIME_APPROXX) * 1000);

  // lấy tx addLp trong db có thời gian là 14 day
  get_tx_addLp = await UniswapDB.find({
    type: "addLiquidity",
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
      if (list_account[i] == get_tx_addLp[j].address) {
        amount += Number(get_tx_addLp[j].amount);
      }
    }
    total_add_of_account.push({
      address: list_account[i],
      amount: amount,
    });
  }
  // get tx remove last -> now
  get_tx_rmLp = await UniswapDB.find({
    type: "removeLiquidity",
  });

  total_after_rm = [];
  list_address = [];
  list_amount_percent = [];
  for (let i = 0; i < total_add_of_account.length; i++) {
    amount = total_add_of_account[i].amount;
    for (let j = 0; j < get_tx_rmLp.length; j++) {
      if (total_add_of_account[i].address == get_tx_rmLp[j].address) {
        amount -= Number(get_tx_rmLp[j].amount);
      }
    }
    amount_percent = (amount * 2 * 175 * 14) / (365 * 100 * 7);
    list_address.push(total_add_of_account[i].address);
    list_amount_percent.push(amount_percent);
    total_after_rm.push({
      address: total_add_of_account[i].address,
      amount: amount,
      amount_percent: amount_percent,
    });
  }

  object = {
    list_address,
    list_amount_percent,
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
