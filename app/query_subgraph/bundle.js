module.exports = {
    get_price_eth: (block_number) => {
        return `{
            bundle (
                id : "1"
                block : {
                    number : ` + block_number + `
                }
            )
        }`
    }
}