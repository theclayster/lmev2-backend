const { validationResult, check, query } = require("express-validator");
const InputDataDecoder = require("ethereum-input-data-decoder");
const UniswapDB = require("../database/uniswap");
const network_eth = require("../blockchain/network/eth");
const web3 = network_eth.get_lib_main_net();
const Commom = require("../commom/constants");
const oraiPool = require("../blockchain/abi/orai_pool.json");
const decoder = new InputDataDecoder(oraiPool);
const BackupDatabaseService = require("../service/backup_database");
const CheckTxErrorService = require("../service/check_tx_error");
const CheckTxRmOmitted = require("../service/check_tx_rm_omitted");
const GetTxBefore16 = require("../service/get_tx_before_16");
const GetTxAfter16 = require("../service/get_tx_after_16");
require("dotenv").config();
module.exports = {
  uniswap_liquidity: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        let error = errors.errors;
        return res.status(200).send({ status: 500, error });
      }

      type = req.body.type;
      address = req.body.address;
      amount = Number(req.body.amount);
      vault = req.body.vault;
      tx_id = req.body.txid;
      checkExistTxHash = await UniswapDB.findOne({ tx_id: tx_id });
      if (checkExistTxHash) {
        return res
          .status(200)
          .send({ status: 500, msg: "tx_id " + tx_id + " already exist" });
      }

      data = await new UniswapDB({
        type: type,
        address: address.toLowerCase(),
        amount: amount,
        vault: vault,
        tx_id: tx_id,
      }).save();

      return res.status(200).send({ status: 200, data });
    } catch (error) {
      return res.status(200).send({ status: 500, error });
    }
  },
  get_uniswap_liquidity: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        let error = errors.errors;
        return res.status(200).send({ status: 500, error });
      }

      account = req.params.account;

      totalBronze = 0;
      totalSilver = 0;
      totalGold = 0;
      totalPlatinum = 0;
      data_db = await UniswapDB.find({});
      // full_db = await UniswapDB.find({  });
      // console.log(data_db)
      for (let i = 0; i < data_db.length; i++) {
        // totalBronze-----------
        if (
          data_db[i].type == "addLiquidity" &&
          data_db[i].vault == Commom.vault.bronze
        ) {
          totalBronze += Number(data_db[i].amount);
        }
        if (
          data_db[i].type == "removeLiquidity" &&
          data_db[i].vault == Commom.vault.bronze
        ) {
          totalBronze -= Number(data_db[i].amount);
        }
        // totalSilver-----------
        if (
          data_db[i].type == "addLiquidity" &&
          data_db[i].vault == Commom.vault.silver
        ) {
          totalSilver += Number(data_db[i].amount);
        }
        if (
          data_db[i].type == "removeLiquidity" &&
          data_db[i].vault == Commom.vault.silver
        ) {
          totalSilver -= Number(data_db[i].amount);
        }
        // totalGold----------
        if (
          data_db[i].type == "addLiquidity" &&
          data_db[i].vault == Commom.vault.gold
        ) {
          totalGold += Number(data_db[i].amount);
        }
        if (
          data_db[i].type == "removeLiquidity" &&
          data_db[i].vault == Commom.vault.gold
        ) {
          totalGold -= Number(data_db[i].amount);
        }
        // totalPlatinum----------------
        if (
          data_db[i].type == "addLiquidity" &&
          data_db[i].vault == Commom.vault.platinum
        ) {
          totalPlatinum += Number(data_db[i].amount);
        }
        if (
          data_db[i].type == "removeLiquidity" &&
          data_db[i].vault == Commom.vault.platinum
        ) {
          totalPlatinum -= Number(data_db[i].amount);
        }
      }

      data = await UniswapDB.find({ address: account.toLowerCase() }).sort({
        updateAt: -1,
      });

      if (!data) {
        return res.status(200).send({
          status: 200,
          data: {
            transaction: [],
          },
          totalBronze: totalBronze.toString(),
          totalSilver: totalSilver.toString(),
          totalGold: totalGold.toString(),
          totalPlatinum: totalPlatinum.toString(),
        });
      }

      transaction = [];
      myBronze = 0;
      mySilver = 0;
      myGold = 0;
      myPlatinum = 0;
      for (let i = 0; i < data.length; i++) {
        // myBronze-----------------
        if (
          data[i].type == "addLiquidity" &&
          data[i].vault == Commom.vault.bronze
        ) {
          myBronze += Number(data[i].amount);
        }
        if (
          data[i].type == "removeLiquidity" &&
          data[i].vault == Commom.vault.bronze
        ) {
          myBronze -= Number(data[i].amount);
        }
        // mySilver--------
        if (
          data[i].type == "addLiquidity" &&
          data[i].vault == Commom.vault.silver
        ) {
          mySilver += Number(data[i].amount);
        }
        if (
          data[i].type == "removeLiquidity" &&
          data[i].vault == Commom.vault.silver
        ) {
          mySilver -= Number(data[i].amount);
        }
        //myGold---------
        if (
          data[i].type == "addLiquidity" &&
          data[i].vault == Commom.vault.gold
        ) {
          myGold += Number(data[i].amount);
        }
        if (
          data[i].type == "removeLiquidity" &&
          data[i].vault == Commom.vault.gold
        ) {
          myGold -= Number(data[i].amount);
        }
        //myPlatinum--------
        if (
          data[i].type == "addLiquidity" &&
          data[i].vault == Commom.vault.platinum
        ) {
          myPlatinum += Number(data[i].amount);
        }
        if (
          data[i].type == "removeLiquidity" &&
          data[i].vault == Commom.vault.platinum
        ) {
          myPlatinum -= Number(data[i].amount);
        }

        let object = {
          _id: data[i]._id,
          type: data[i].type,
          address: data[i].address,
          amount: data[i].amount,
          vault: data[i].vault,
          tx_id: data[i].tx_id,
          createAt: Date.parse(data[i].createAt) / 1000,
          updateAt: Date.parse(data[i].updateAt) / 1000,
        };

        transaction.push(object);
      }

      return res.status(200).send({
        status: 200,
        data: {
          transaction,
        },
        totalBronze: totalBronze.toString(),
        totalSilver: totalSilver.toString(),
        totalGold: totalGold.toString(),
        totalPlatinum: totalPlatinum.toString(),
        myBronze: myBronze.toString(),
        mySilver: mySilver.toString(),
        myGold: myGold.toString(),
        myPlatinum: myPlatinum.toString(),
      });
    } catch (error) {
      return res.status(200).send({ status: 500, error });
    }
  },
  uniswap_liquidity_v1: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        let error = errors.errors;
        return res.status(200).send({ status: 500, error });
      }

      type = req.body.type;
      address = req.body.address;
      amount = Number(req.body.amount);
      vault = req.body.vault;
      tx_id = req.body.txid;

      checkExistTxHash = await UniswapDB.findOne({ tx_id: tx_id });
      if (checkExistTxHash) {
        return res
          .status(200)
          .send({ status: 500, msg: "tx_id " + tx_id + " already exist" });
      }

      data = await web3.eth.getTransaction(tx_id);
      if (!data) {
        return res
          .status(200)
          .send({ status: 500, msg: "tx_id " + tx_id + " not exist" });
      }
      input_data = data.input;

      decodeTx = await decoder.decodeData(input_data);

      get_tx_receipt = await web3.eth.getTransactionReceipt(tx_id);
      if (!get_tx_receipt) {
        return res.status(200).send({
          status: 500,
          msg: "tx_id " + tx_id + " not found on etherscan",
        });
      }

      if (decodeTx.method == "addLiquidity") {
        amount_lp = web3.utils.hexToNumberString(get_tx_receipt.logs[3].data);
        data = await new UniswapDB({
          type: Commom.type_uniswap.add_lp,
          address: address,
          amount: amount_lp,
          vault: vault,
          tx_id: tx_id,
        }).save();
        return res.status(200).send({ status: 200, data });
      }
      if (decodeTx.method == "addLiquidityETH") {
        amount_lp = web3.utils.hexToNumberString(get_tx_receipt.logs[3].data);
        data = await new UniswapDB({
          type: Commom.type_uniswap.add_lp,
          address: address,
          amount: amount_lp,
          vault: vault,
          tx_id: tx_id,
        }).save();
        return res.status(200).send({ status: 200, data });
      }
      if (decodeTx.method == "removeLiquidityETHWithPermit") {
        amount_lp = decodeTx.inputs[1];
        data = await new UniswapDB({
          type: Commom.type_uniswap.remove_lp,
          address: address,
          amount: amount_lp,
          vault: vault,
          tx_id: tx_id,
        }).save();
        return res.status(200).send({ status: 200, data });
      }
      if (decodeTx.method == "removeLiquidityWithPermit") {
        amount_lp = decodeTx.inputs[2];
        data = await new UniswapDB({
          type: Commom.type_uniswap.remove_lp,
          address: address,
          amount: amount_lp,
          vault: vault,
          tx_id: tx_id,
        }).save();
        return res.status(200).send({ status: 200, data });
      }
      if (decodeTx.method == "removeLiquidity") {
        amount_lp = decodeTx.inputs[2];
        data = await new UniswapDB({
          type: Commom.type_uniswap.remove_lp,
          address: address,
          amount: amount_lp,
          vault: vault,
          tx_id: tx_id,
        }).save();
        return res.status(200).send({ status: 200, data });
      }
      return res
        .status(200)
        .send({ status: 200, msg: "method of tx_id not support" });
    } catch (error) {
      return res.status(200).send({ status: 500, error });
    }
  },
  get_list_reward: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        let error = errors.errors;
        return res.status(200).send({ status: 500, error });
      }

      vault = req.body.vault;

      if (
        typeof process.env.ADDRESS_POOL == "undefined" ||
        typeof process.env.TIME_STAMP_START == "undefined" ||
        typeof process.env.TIME_STAMP_22 == "undefined" ||
        typeof process.env.TIME_STAMP_16 == "undefined" ||
        typeof process.env.ADDRESS_POOL == "undefined"
      ) {
        return res.status(200).send({
          status: 200,
          msg:
            "You need config  TIME_STAMP_START=1609354256,TIME_STAMP_16=1610755322,ADDRESS_POOL=0x9081b50bad8beefac48cc616694c26b027c559bb in file .env",
        });
      }
      let VAULT;
      time_now = Math.floor(Date.now() / 1000);

      if (vault == "platinum") {
        VAULT = Commom.reward.platinum;
      } else if (vault == "gold") {
        VAULT = Commom.reward.gold;
      } else if (vault == "silver") {
        VAULT = Commom.reward.silver;
      } else if (vault == "bronze") {
        VAULT = Commom.reward.bronze;
      } else {
        return res.status(200).send({
          status: 200,
          msg: "Sorry ! System only support vault platium,gold,silver,bronze",
        });
      }

      back_up_db = await BackupDatabaseService.backup_database();
      if (back_up_db == false) {
        return res.status(200).send({
          status: 200,
          msg: "Sorry ! Error when backup database",
        });
      }

      checl_tx_error = await CheckTxErrorService.check_tx_error();
      if (checl_tx_error == false) {
        return res.status(200).send({
          status: 200,
          msg: "Sorry ! Error when check tx error in database",
        });
      }

      check_tx_omitted = await CheckTxRmOmitted.check_tx_rm_omitted();
      if (check_tx_omitted == false) {
        return res.status(200).send({
          status: 200,
          msg: "Sorry ! Error when check tx rm omitted",
        });
      }

      total_after_rm = [];
      list_address = [];
      reward_amound = [];

      // kiểm tra tx trước ngày 16 xem còn nhận thưởng k
      if (process.env.TIME_STAMP_22 > time_now) {
        get_tx_before_22 = await GetTxBefore16.get_tx_before_16(
          time_now,
          VAULT
        );

        if (get_tx_before_22.status == 500) {
          return res.status(200).send({
            status: 200,
            msg: "Sorry ! Error when get tx before 16/01/2020",
          });
        }

        list_address.concat(get_tx_before_22.list_address);
        reward_amound.concat(get_tx_before_22.reward_amound);
        total_after_rm.concat(get_tx_before_22.total_after_rm);
      }

      get_tx_after_16 = await GetTxAfter16.get_tx_after_16(time_now, VAULT);
      if (get_tx_after_16.status == 500) {
        return res.status(200).send({
          status: 200,
          msg: "Sorry ! Error when get tx after 16/01/2020",
        });
      }
      list_address.concat(get_tx_after_16.list_address);
      reward_amound.concat(get_tx_after_16.reward_amound);
      total_after_rm.concat(get_tx_after_16.total_after_rm);

      data = {
        list_address,
        reward_amound,
      };

      return res.status(200).send({
        status: 200,
        data,
        items: total_after_rm,
      });
    } catch (error) {
      return res.status(200).send({ status: 500, error });
    }
  },
};
