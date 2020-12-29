const { validationResult, check, query } = require("express-validator");
const InputDataDecoder = require("ethereum-input-data-decoder");
const UniswapDB = require("../database/uniswap");
const network_eth = require("../blockchain/network/eth");
const web3 = network_eth.get_lib_main_net();
const Commom = require("../commom/constants");
const oraiPool = require("../blockchain/abi/orai_pool.json");
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
        address: address,
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
      data_db = await UniswapDB.find({ address: account });
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

      data = await UniswapDB.find({ address: account });
      if (!data) {
        return res.status(200).send({
          status: 200,
          data: {
            transaction: [],
          },
          totalBronze,
          totalSilver,
          totalGold,
          totalPlatinum,
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
        //myGold--------
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

        transaction.push(data[i]);
      }

      return res.status(200).send({
        status: 200,
        data: {
          transaction,
        },
        totalBronze,
        totalSilver,
        totalGold,
        totalPlatinum,
        myBronze,
        mySilver,
        myGold,
        myPlatinum,
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
};
