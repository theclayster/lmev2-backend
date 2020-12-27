module.exports = {
    get_snap_shot_list: (account, pairs) => {
        let query = "{"
        for (let i = 0; i < pairs.length; i++) {
            query += `p` + pairs[i].id + `:liquidityPositionSnapshots(
                orderBy: timestamp
                orderDirection: desc
                first: 1000
                where: {
                    user: "` + account + `"
                    pair: "` + pairs[i].id + `"
                    liquidityTokenBalance: 0
                }
            ){
                timestamp
            }
            `

        }
        query += "}"

        return query
    },
    get_snap_shot: (account, pair) => {
        return `{
            liquidityPositionSnapshots(
                orderBy: timestamp
                orderDirection: desc
                first: 1000
                where : {
                    user: "` + account + `"
                    pair: "` + pair + `"
                    liquidityTokenBalance: 0
                }
            )
            {
                timestamp
            }
        }`
    }
}