const { validationResult, check, query } = require("express-validator");
const InputDataDecoder = require("ethereum-input-data-decoder");
const UniswapDB = require("../database/uniswap");
const network_eth = require("../blockchain/network/eth");
const web3 = network_eth.get_lib_main_net();
const Commom = require("../commom/constants");
const oraiPool = require("../blockchain/abi/orai_pool.json");
const get_tx = require("../query_subgraph/get_tx");
const decoder = new InputDataDecoder(oraiPool);
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

      time = {
        gold: 0,
        platinum: 0,
        bronze: 0,
        silver: 0,
      };
      for (let i = 0; i < data.length; i++) {
        createAt = Date.parse(data[i].createAt) / 1000;
        if (
          data[i].type == "addLiquidity" &&
          data[i].vault == Commom.vault.bronze
        ) {
          if (createAt < time.bronze || time.bronze == 0) {
            time.bronze = createAt;
          }
        }
        if (
          data[i].type == "addLiquidity" &&
          data[i].vault == Commom.vault.silver
        ) {
          if (createAt < time.silver || time.silver == 0) {
            time.silver = createAt;
          }
        }
        if (
          data[i].type == "addLiquidity" &&
          data[i].vault == Commom.vault.gold
        ) {
          if (createAt < time.gold || time.gold == 0) {
            time.gold = createAt;
          }
        }
        if (
          data[i].type == "addLiquidity" &&
          data[i].vault == Commom.vault.platinum
        ) {
          if (createAt < time.platinum || time.platinum == 0) {
            time.platinum = createAt;
          }
        }
      }

      for (let i = 0; i < data.length; i++) {
        createAt = Date.parse(data[i].createAt) / 1000;

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

        // myBronze-----------------
        if (
          data[i].type == "addLiquidity" &&
          data[i].vault == Commom.vault.bronze
        ) {
          transaction.push(object);
          myBronze += Number(data[i].amount);
        }
        if (
          data[i].type == "removeLiquidity" &&
          data[i].vault == Commom.vault.bronze
        ) {
          if (time.bronze < createAt) {
            transaction.push(object);
            myBronze -= Number(data[i].amount);
          }
        }
        // mySilver--------
        if (
          data[i].type == "addLiquidity" &&
          data[i].vault == Commom.vault.silver
        ) {
          transaction.push(object);
          mySilver += Number(data[i].amount);
        }
        if (
          data[i].type == "removeLiquidity" &&
          data[i].vault == Commom.vault.silver
        ) {
          if (time.silver < createAt) {
            transaction.push(object);
            mySilver -= Number(data[i].amount);
          }
        }
        //myGold---------
        if (
          data[i].type == "addLiquidity" &&
          data[i].vault == Commom.vault.gold
        ) {
          transaction.push(object);
          myGold += Number(data[i].amount);
        }
        if (
          data[i].type == "removeLiquidity" &&
          data[i].vault == Commom.vault.gold
        ) {
          if (time.gold < createAt) {
            transaction.push(object);
            myGold -= Number(data[i].amount);
          }
        }
        //myPlatinum--------
        if (
          data[i].type == "addLiquidity" &&
          data[i].vault == Commom.vault.platinum
        ) {
          transaction.push(object);
          myPlatinum += Number(data[i].amount);
        }
        if (
          data[i].type == "removeLiquidity" &&
          data[i].vault == Commom.vault.platinum
        ) {
          if (time.platinum < createAt) {
            transaction.push(object);
            myPlatinum -= Number(data[i].amount);
          }
        }
      }
      // console.log("day la ",time);
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
          address: address.toLowerCase(),
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
  add_tx_database: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let error = errors.errors;
      return res.status(200).send({ status: 500, error });
    }
    let tx_id = req.body.tx_id;
    let vault = req.body.vault;

    get_tx_db = await UniswapDB.find({
      tx_id: tx_id,
    });
    if (get_tx_db) {
      return res.status(200).send({
        status: 200,
        msg: "tx_id already exist in db ",
        item: get_tx_db,
      });
    }

    get_tx_data = await web3.eth.getTransaction(tx_id);
    console.log(get_tx_data);
    if (!get_tx_data) {
      return res
        .status(200)
        .send({ status: 500, msg: "tx_id " + tx_id + " not exist" });
    }

    decodeTx = await decoder.decodeData(get_tx_data.input);
    get_tx_receipt = await web3.eth.getTransactionReceipt(tx_id);
    console.log(decodeTx);
    if (!get_tx_receipt || get_tx_receipt.status === false) {
      return res
        .status(200)
        .send({ status: 500, msg: "tx_id have status false" });
    }

    let result;
    if (decodeTx.method == "addLiquidityETH") {
      amount =
        Number(web3.utils.hexToNumberString(get_tx_receipt.logs[3].data)) /
        Math.pow(10, 18);

      result = await new UniswapDB({
        type: "addLiquidity",
        address: get_tx_data.from,
        amount,
        vault,
        tx_id,
      }).save();
    } else if (decodeTx.method == "removeLiquidityETHWithPermit") {
      amount =
        Number(web3.utils.hexToNumberString(decodeTx.inputs[1])) /
        Math.pow(10, 18);

      result = await new UniswapDB({
        type: "removeLiquidity",
        address: get_tx_data.from,
        amount,
        vault,
        tx_id,
      }).save();
    } else {
      return res
        .status(200)
        .send({ status: 500, msg: "tx have method not support" });
    }

    return res.status(200).send({ status: 200, item: result });
  },
};
