const { validationResult, check } = require("express-validator");
const OraiEnventDB = require("../database/orai_event");
const { get } = require("../router");
require('dotenv').config()

module.exports = {
    tracking_lp_event: async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                let error = errors.errors;
                return res.status(200).send({ status: 500, error });
            }

            account = req.params.account
            get_all_account = await OraiEnventDB.find({ 'from_address': account })


            myLiquidity = 0
            totalLiquidity = 0
            console.log(get_all_account);
            for (let i = 0; i < get_all_account.length; i++) {
                if (get_all_account[i].method == "removeLiquidityETHWithPermit" || get_all_account[i].method == "removeLiquidityWithPermit" || get_all_account[i].method == "removeLiquidity" || get_all_account[i].method == "removeLiquidityETH") {
                    
                    myLiquidity -= get_all_account[i].liquidity
                }
                if (get_all_account[i].method == "addLiquidityETH" || get_all_account[i].method == "addLiquidity") {
                    myLiquidity += get_all_account[i].liquidity
                }

            }

            get_all_address_pool = await OraiEnventDB.find({ 'addres_pool': process.env.ADDRESS_POOL })

            for (let i = 0; i < get_all_address_pool.length; i++) {
                if (get_all_address_pool[i].method == "removeLiquidityETHWithPermit" || get_all_address_pool[i].method == "removeLiquidityWithPermit" || get_all_address_pool[i].method == "removeLiquidity" || get_all_address_pool[i].method == "removeLiquidityETH") {
                    totalLiquidity -= get_all_address_pool[i].liquidity
                }
                if (get_all_address_pool[i].method == "addLiquidityETH" || get_all_address_pool[i].method == "addLiquidity") {
                    totalLiquidity += get_all_address_pool[i].liquidity
                }

            }

            if (get_all_account.length > 0) {
                return res.status(200).send({
                    status: 200, data: {
                        transaction: get_all_account
                    }, myLiquidity, totalLiquidity: totalLiquidity
                });
            } else {
                return res.status(200).send({ status: 200, data: [] });
            }
        } catch (error) {
            return res.status(200).send({ status: 500, error });
        }

    }
}  