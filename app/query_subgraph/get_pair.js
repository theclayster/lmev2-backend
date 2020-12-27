module.exports = {
    get_pair_lp_token: (account) => {
        return ` 
            {
                liquidityPositions (
                    first : 1000
                    skipp :0
                    where :{
                        user : "` + account + `"
                    }
                ){
                    pair {
                        id
                    }
                    liquidityTokenBalance
                }
            }
        
        `
    },
    get_active_pair: (pair) => {
        return `
            {
                pairs (
                    first : 1000
                    skip : 0
                    where : {
                        id_in : [` + pair + `]
                        volumeUSD_gte: 1
                        reserveUSD_gte: 1
                    }
                ){
                    id
                }
            }

        `

    }
}