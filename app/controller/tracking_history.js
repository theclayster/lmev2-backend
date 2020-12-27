const { validationResult, check, query } = require("express-validator");
const Platform = require('../platform/index')
const requestPromise = require('request-promise');
const QUERY_TX = require("../query_subgraph/get_tx")
const QUERY_PAIR = require("../query_subgraph/get_pair")
const QUERY_GET_DETAILS_PAIR = require("../query_subgraph/get_details_pair")

module.exports = {
    tracking_history: async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                let error = errors.errors;
                return res.status(200).send({ status: 500, error });
            }

            from_timestamp = req.body.from_timestamp
            to_timestamp = req.body.to_timestamp
            account = req.params.account
            block_number = 0
            data_pair = await requestPromise.post(Platform.graphql_end_point, {
                json: {
                    query: QUERY_PAIR.get_pair_lp_token(account)
                }
            })
            list_pair = []
            if (data_pair.data.liquidityPositions.length == 0) {
                return res.status(200).send({ status: 200, data: [] });
            } else {
                for (let i = 0; i < data_pair.data.liquidityPositions.length; i++) {
                    list_pair.push(JSON.stringify(data_pair.data.liquidityPositions[i].pair.id))

                }
            }

            data_pair_active = await requestPromise.post(Platform.graphql_end_point, {
                json: {
                    query: QUERY_PAIR.get_active_pair(list_pair)
                }
            })

            if (data_pair_active.data.pairs.length == 0) {
                return res.status(200).send({ status: 200, data: [] });
            }

            var data_burn = []
            for (let i = 0; i < data_pair_active.data.pairs.length; i++) {
                data_burn_query = await requestPromise.post(Platform.graphql_end_point, {
                    json: {
                        query: QUERY_TX.get_tx_burn_with_from_to(account, data_pair_active.data.pairs[i].id, from_timestamp, to_timestamp)
                    }
                })
                data_burn_query.data.id = data_pair_active.data.pairs[i].id
                data_burn.push(data_burn_query)

            }

            total_burn = []
            for (let i = 0; i < data_burn.length; i++) {
                if (data_burn[i].data.burns.length > 0) {
                    burn = {
                        "amount0": 0,
                        "amount1": 0,
                        "liquidity": 0,
                    }
                    block_number = 0
                    for (let j = 0; j < data_burn[i].data.burns.length; j++) {
                        if (block_number < Number(data_burn[i].data.burns[j].transaction.blockNumber)) {
                            block_number = Number(data_burn[i].data.burns[j].transaction.blockNumber)
                        }

                        burn.amount0 += Number(data_burn[i].data.burns[j].amount0)
                        burn.amount1 += Number(data_burn[i].data.burns[j].amount1)
                        burn.liquidity += Number(data_burn[i].data.burns[j].liquidity)
                    }
                    burn.id = data_burn[i].data.id
                    burn.block_number = block_number
                    total_burn.push(burn)
                }

            }

            data_mint = []
            for (let i = 0; i < data_pair_active.data.pairs.length; i++) {

                data_mint_query = await requestPromise.post(Platform.graphql_end_point, {
                    json: {
                        query: QUERY_TX.get_tx_mint_with_from_to(account, data_pair_active.data.pairs[i].id, from_timestamp, to_timestamp)
                    }
                })
                data_mint_query.data.id = data_pair_active.data.pairs[i].id
                data_mint.push(data_mint_query)

            }

            let total_mint = []
            for (let i = 0; i < data_mint.length; i++) {
                if (data_mint[i].data.mints.length > 0) {
                    mint = {
                        "amount0": 0,
                        "amount1": 0,
                        "liquidity": 0,
                    }
                    block_number = 0
                    for (let j = 0; j < data_mint[i].data.mints.length; j++) {
                        if (block_number < Number(data_mint[i].data.mints[j].transaction.blockNumber)) {
                            block_number = Number(data_mint[i].data.mints[j].transaction.blockNumber)
                        }

                        mint.amount0 += Number(data_mint[i].data.mints[j].amount0)
                        mint.amount1 += Number(data_mint[i].data.mints[j].amount1)
                        mint.liquidity += Number(data_mint[i].data.mints[j].liquidity)
                    }

                    mint.id = data_mint[i].data.id
                    mint.block_number = block_number
                    total_mint.push(mint)
                }

            }

            calculate_token_amount = []
            for (let i = 0; i < total_mint.length; i++) {
                for (let j = 0; j < total_burn.length; j++) {
                    if (total_mint[i].id == total_burn[j].id) {
                        let total = {
                            "amount0": total_mint[i].amount0 + total_burn[j].amount0,
                            "amount1": total_mint[i].amount1 + total_burn[j].amount1,
                            "liquidity": total_mint[i].liquidity + total_burn[j].liquidity,
                            "id": total_mint[i].id
                        }
                        if (total_mint[i].block_number < total_burn[j].block_number) {
                            total.block_number = total_burn[j].block_number
                        } else {
                            total.block_number = total_mint[i].block_number
                        }
                        calculate_token_amount.push(total)
                        break
                    }

                }

            }

            var resp = []
            for (let i = 0; i < calculate_token_amount.length; i++) {

                data_get_details_request = await requestPromise.post(Platform.graphql_end_point, {
                    json: {
                        query: QUERY_GET_DETAILS_PAIR.get_details_pair_and_bundle(calculate_token_amount[i].id, calculate_token_amount[i].block_number)
                    }
                })
                liquidity_token = calculate_token_amount[i].liquidity
                liquidity_token_percent = liquidity_token / data_get_details_request.data.pair.totalSupply
               
                token0 = {
                    'symbol': data_get_details_request.data.pair.token0.symbol,
                    'starting_amount': calculate_token_amount[i].amount0,
                    'cur_amount': liquidity_token_percent * Number(data_get_details_request.data.pair.reserve0),
                    'cur_price': Number(data_get_details_request.data.pair.token0.derivedETH) * Number(data_get_details_request.data.bundle.ethPrice)
                }
                token1 = {
                    'symbol': data_get_details_request.data.pair.token1.symbol,
                    'starting_amount': calculate_token_amount[i].amount1,
                    'cur_amount': liquidity_token_percent * Number(data_get_details_request.data.pair.reserve1),
                    'cur_price': Number(data_get_details_request.data.pair.token1.derivedETH) * Number(data_get_details_request.data.bundle.ethPrice)
                }
                resp.push({
                    'total_volume': data_get_details_request.data.pair.volumeUSD,
                    'pair_address': data_get_details_request.data.pair.id,
                    'reserve_usd': data_get_details_request.data.pair.reserveUSD,
                    'liquidity_token': liquidity_token,
                    'liquidity_token_percent': liquidity_token_percent,
                    'token0': token0,
                    'token1': token1,
                    'platform': "sushiswap"
                })

            }
            return res.status(200).send({ status: 200, data: resp });
        } catch (error) {
            return res.status(200).send({ status: 500, error });
        }

    }

}
