const NETWORKS = {
    GANACHE: "ganache",
    GORLI: "gorliTestNet",
    RINKEBY: "rinkebyTestNet",
    KOVAN: "kovanTestNet",
    ROPSTEN: "ropstenTestNet",
    MAINNET: "mainNet",
    POLYGON_MAINNET: "polygonMainNet",
    POLYGON_TESTNET: "polygonTestNet",
}

const NETWORK_URL = {
    INFURA_GORLI_URL:"https://goerli.infura.io/v3/3672af8c7c6b44f3ae148b6e574d0a69",
    INFURA_RINKEBY_URL:"https://rinkeby.infura.io/v3/3672af8c7c6b44f3ae148b6e574d0a69",
    INFURA_KOVAN_URL:"https://kovan.infura.io/v3/3672af8c7c6b44f3ae148b6e574d0a69",
    INFURA_ROPSTEN_URL:"https://ropsten.infura.io/v3/3672af8c7c6b44f3ae148b6e574d0a69",
    INFURA_MAINNET_URL:"https://mainnet.infura.io/v3/3672af8c7c6b44f3ae148b6e574d0a69",
    INFURA_POLYGON_MAINNET_URL:"https://polygon-mainnet.infura.io/v3/3672af8c7c6b44f3ae148b6e574d0a69",
    INFURA_POLYGON_TESTNET_URL:"https://polygon-mumbai.infura.io/v3/3672af8c7c6b44f3ae148b6e574d0a69",  
}

module.exports = {
    NETWORKS,
    NETWORK_URL
}
