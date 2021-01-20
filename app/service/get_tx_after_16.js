const PATH = require("../commom/path").path;
const UniswapDB = require("../database/uniswap");
const fs = require("fs").promises;
var path = require("path");
const appDir = path.dirname(require.main.filename);
const eth_network = require("../blockchain/network/eth");
const web3 = eth_network.get_lib_main_net();
const async = require("async");
require("dotenv").config();
module.exports = {
  get_tx_after_16: async (time_now, VAULT) => {
    try {
      time_before = new Date((time_now - VAULT.TIME_APPROXX) * 1000);
      time_7day_before = new Date(
        (time_now - VAULT.TIME_APPROXX - 604800) * 1000
      );

      TIME_CHANGE_PERCENT = process.env.TIME_STAMP_16;

      get_tx_addLp = [];
      if (TIME_CHANGE_PERCENT >= Date.parse(time_7day_before) / 1000) {
        time_7day_before = new Date(TIME_CHANGE_PERCENT * 1000);
      }

      // lấy tx addLp trong db có thời gian là 14 day
      get_tx_addLp = await UniswapDB.find({
        type: "addLiquidity",
        vault: VAULT.type,
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
        vault: VAULT.type,
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
          amount_percent =
            (amount * 2 * VAULT.APY * VAULT.TOTAL_DAY) / (365 * 100 * 7);
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
        status: 200,
        list_address,
        reward_amound,
        total_after_rm,
      };
      return result;
    } catch (error) {
      result = {
        status: 500,
        error: error,
      };
      return result;
    }
  },
};
