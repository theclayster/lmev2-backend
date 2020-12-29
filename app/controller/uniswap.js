const { validationResult, check, query } = require("express-validator");
const UniswapDB = require("../database/uniswap");
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

      totalLiquidity = 0;
      data_db = await UniswapDB.find({ address: account });
      for (let i = 0; i < data_db.length; i++) {
        if (data_db[i].type == "addLiquidity") {
          totalLiquidity += Number(data_db[i].amount);
        }
        if (data_db[i].type == "removeLiquidity") {
          totalLiquidity -= Number(data_db[i].amount);
        }
      }

      data = await UniswapDB.find({ address: account });
      if (!data) {
        return res.status(200).send({
          status: 200,
          data: {
            transaction: [],
          },
          totalLiquidity,
        });
      }

      transaction = [];
      myLiquidity = 0;
      for (let i = 0; i < data.length; i++) {
        if (data[i].type == "addLiquidity") {
          myLiquidity += Number(data[i].amount);
        }
        if (data[i].type == "removeLiquidity") {
          myLiquidity -= Number(data[i].amount);
        }
        transaction.push(data[i]);
      }

      return res.status(200).send({
        status: 200,
        data: {
          transaction,
        },
        totalLiquidity,
        myLiquidity,
      });
    } catch (error) {
      return res.status(200).send({ status: 500, error });
    }
  },
};
