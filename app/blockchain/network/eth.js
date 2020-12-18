const Web3 = require('web3');

module.exports = ({
    get_lib_main_net: () => {
        const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/f19c5e0f2fd047e9bc14b5fdd5577e5b"))
        return web3
    },
    get_lib_main_net_socket: () => {
        web3_socket = new Web3(new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws/v3/f19c5e0f2fd047e9bc14b5fdd5577e5b"))
        return web3_socket
    },

})