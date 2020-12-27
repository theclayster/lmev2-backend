const { validationResult, check, query } = require("express-validator");
const OraiEnventDB = require("../database/orai_event");
const QUERY_TX = require("../query_subgraph/get_tx")
const { get } = require("../router");
const Platform = require('../platform/index')
const requestPromise = require('request-promise');
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


            for (let i = 0; i < get_all_account.length; i++) {
                if (get_all_account[i].method == "removeLiquidityETHWithPermit" || get_all_account[i].method == "removeLiquidityWithPermit" || get_all_account[i].method == "removeLiquidity" || get_all_account[i].method == "removeLiquidityETH") {

                    myLiquidity -= Number(get_all_account[i].liquidity)
                }
                if (get_all_account[i].method == "addLiquidityETH" || get_all_account[i].method == "addLiquidity") {
                    myLiquidity += Number(get_all_account[i].liquidity)
                }

            }

            get_all_address_pool = await OraiEnventDB.find({ 'addres_pool': process.env.ADDRESS_POOL })

            for (let i = 0; i < get_all_address_pool.length; i++) {
                if (get_all_address_pool[i].method == "removeLiquidityETHWithPermit" || get_all_address_pool[i].method == "removeLiquidityWithPermit" || get_all_address_pool[i].method == "removeLiquidity" || get_all_address_pool[i].method == "removeLiquidityETH") {
                    totalLiquidity -= Number(get_all_address_pool[i].liquidity)
                }
                if (get_all_address_pool[i].method == "addLiquidityETH" || get_all_address_pool[i].method == "addLiquidity") {
                    totalLiquidity += Number(get_all_address_pool[i].liquidity)
                }

            }

            if (get_all_account.length > 0) {
                return res.status(200).send({
                    status: 200, data: {
                        transaction: get_all_account
                    }, myLiquidity, totalLiquidity
                });
            } else {
                return res.status(200).send({
                    status: 200, data: {
                        transaction: []
                    }, myLiquidity, totalLiquidity
                });
            }
        } catch (error) {
            return res.status(200).send({ status: 500, error });
        }

    },
    tracking_lp_event_v2: async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                let error = errors.errors;
                return res.status(200).send({ status: 500, error });
            }

            account = req.params.account

            TIMESTAMP_START_EVENT = process.env.TIMESTAMP_START_EVENT
            if (TIMESTAMP_START_EVENT == undefined) {
                return res.status(200).send({ status: 500, msg: "Systeem error! Admin need create file .env and variable TIMESTAMP_START_EVENT eg:TIMESTAMP_START_EVENT=1608430000" });
            }

            ADDRESS_POOL_POOL = process.env.ADDRESS_POOL
            if (ADDRESS_POOL_POOL == undefined) {
                return res.status(200).send({ status: 500, msg: "Systeem error! Admin need create file .env and variable ADDRESS_POOL eg:ADDRESS_POOL=0x9081b50bad8beefac48cc616694c26b027c559bb" });
            }

            let query_mint = QUERY_TX.get_tx_mints(account, ADDRESS_POOL_POOL, TIMESTAMP_START_EVENT)

            data_mint = await requestPromise.post(Platform.graphql_end_point, {
                json: {
                    query: query_mint
                }
            })
            total_lp_mint = 0
            transaction = []
            for (let i = 0; i < data_mint.data.mints.length; i++) {
                total_lp_mint += Number(data_mint.data.mints[i].liquidity)
                data_mint.data.mints[i].method = "mint"
                transaction.push(data_mint.data.mints[i])
            }

            let query_burn = QUERY_TX.get_tx_burn(account, ADDRESS_POOL_POOL, TIMESTAMP_START_EVENT)
            data_burn = await requestPromise.post(Platform.graphql_end_point, {
                json: {
                    query: query_burn
                }
            })

            total_lp_burn = 0

            for (let i = 0; i < data_burn.data.burns.length; i++) {
                total_lp_burn += Number(data_burn.data.burns[i].liquidity)
                data_burn.data.burns[i].method = "burn"
                transaction.push(data_burn.data.burns[i])
            }

            let myLiquidity = total_lp_mint - total_lp_burn
            data_mint_of_pool = await requestPromise.post(Platform.graphql_end_point, {
                json: {
                    query: QUERY_TX.get_tx_mints_of_pool(ADDRESS_POOL_POOL, TIMESTAMP_START_EVENT)
                }
            })

            total_liquidity_mint = 0
            for (let i = 0; i < data_mint_of_pool.data.mints.length; i++) {

                total_liquidity_mint += Number(data_mint_of_pool.data.mints[i].liquidity)
            }

            data_burn_of_pool = await requestPromise.post(Platform.graphql_end_point, {
                json: {
                    query: QUERY_TX.get_tx_burn_of_pool(ADDRESS_POOL_POOL, TIMESTAMP_START_EVENT)
                }
            })

            total_liquidity_burn = 0
            for (let i = 0; i < data_burn_of_pool.data.burns.length; i++) {

                total_liquidity_burn += Number(data_burn_of_pool.data.burns[i].liquidity)
            }


            totalLiquidity = total_liquidity_mint - total_liquidity_burn

            return res.status(200).send({
                status: 200, data: {
                    transaction
                }, myLiquidity, totalLiquidity
            });

        } catch (error) {
            return res.status(200).send({ status: 500, error });
        }

    }
}  