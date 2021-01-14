module.exports = {
  get_tx_mints: (account, pair, timestamp) => {
    let QUERY_GET_PAIR_MINTS = `{
      mints (
        orderBy: timestamp
        orderDirection: asc
        where: {
          timestamp_gte: ` + timestamp + `
          to: "` + account + `"
          pair: "` + pair + `"
        }
      ){
        id
        timestamp
        transaction {
          blockNumber
        }
        amount0
        amount1
        liquidity
      }
    }`

    return QUERY_GET_PAIR_MINTS
  },
  get_tx_mints_of_pool: (pair, timestamp) => {
    let QUERY_GET_PAIR_MINTS = `{
      mints (
        orderBy: timestamp
        orderDirection: asc
        where: {
          timestamp_gte: ` + timestamp + `
          pair: "` + pair + `"
        }
      ){
        id
        timestamp
        transaction {
          blockNumber
        }
        amount0
        amount1
        liquidity
      }
    }`

    return QUERY_GET_PAIR_MINTS
  },
  get_tx_burn: (account, pair, timestamp) => {
    let QUERY_GET_PAIR_BURN = `{
      burns(
        orderBy: timestamp
        orderDirection:  asc
        where : {

          timestamp_gte: ` + timestamp + `
          sender: "` + account + `"
          pair: "` + pair + `"
        }
      ){
        id
        timestamp
        transaction {
          blockNumber
        }
        amount0
        amount1
        liquidity
      }
    }`

    return QUERY_GET_PAIR_BURN
  },
  get_tx_burn_with_from_to: (account, pair, from_timestamp, to_timestamp) => {
    let QUERY_GET_PAIR_BURN = `{
      burns(
        orderBy: timestamp
        orderDirection:  asc
        where : {
          timestamp_gte: "` + from_timestamp + `"
          timestamp_lt : "` + to_timestamp + `"
          sender: "` + account + `"
          pair: "` + pair + `"
        }
      ){
        id
        timestamp
        transaction {
          blockNumber
        }
        amount0
        amount1
        liquidity
      }
    }`

    return QUERY_GET_PAIR_BURN
  },
  get_tx_burn_of_pool: (pair, timestamp) => {
    let QUERY_GET_PAIR_BURN = `{
      burns(
        orderBy: timestamp
        orderDirection:  asc
        where : {
          timestamp_gte: ` + timestamp + `
          pair: "` + pair + `"
        }
      ){
        id
        timestamp
        transaction {
          timestamp
          blockNumber
        }
        amount0
        amount1
        liquidity
      }
    }`

    return QUERY_GET_PAIR_BURN
  },
  get_tx_mint_with_from_to: (account, pair, from_timestamp, to_timestamp) => {
    return `{
      mints(
        orderBy: timestamp
        orderDirection:  asc
        where : {
          timestamp_gte: "` + from_timestamp + `"
          timestamp_lt : "` + to_timestamp + `"
          to: "` + account + `"
          pair: "` + pair + `"
        }
      ){
        id
        timestamp
        transaction {
          blockNumber
        }
        amount0
        amount1
        liquidity
      }
    }`

  },
}