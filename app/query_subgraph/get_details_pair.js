module.exports = {
    get_details_pair_and_bundle: (pair, block_number) => {
        return `
            {
                pair (
                    id : "`+ pair + `"
                    block : {
                        number : ` + block_number + `
                    }
                ){
                    id
                    reserveUSD
                    reserve0
                    reserve1
                    token0 {
                        symbol
                        derivedETH
                    }
                    token1 {
                        symbol
                        derivedETH
                    }
                    totalSupply
                    volumeUSD
                }
                bundle (
                    id : "1"
                    block: { 
                        number : ` + block_number + `
                    }
                ){
                    ethPrice
                }
            }
        `
    }
}