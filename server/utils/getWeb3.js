const Web3 = require("web3");
const ganache = require("ganache-cli");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const dotenv = require('dotenv');
const { NETWORKS, NETWORK_URL } = require("../constants/blockchain");
dotenv.config();

function generateProvider(providerName){
    
    let provider;

    try {

        let providerUrl;

        switch(providerName){
            case NETWORKS.GANACHE:
                providerUrl = ganache.provider();
                break;
            case NETWORKS.GORLI:
                providerUrl = NETWORK_URL.INFURA_GORLI_URL;
                break;
            case NETWORKS.KOVAN:
                providerUrl = NETWORK_URL.INFURA_KOVAN_URL;
                break;
            case NETWORKS.RINKEBY:
                providerUrl = NETWORK_URL.INFURA_RINKEBY_URL;
                break;
            case NETWORKS.ROPSTEN:
                providerUrl = NETWORK_URL.INFURA_ROPSTEN_URL;
                break;
            case NETWORKS.MAINNET:
                providerUrl = NETWORK_URL.INFURA_MAINNET_URL;
                break;
            case NETWORKS.POLYGON_MAINNET:
                providerUrl = NETWORK_URL.INFURA_POLYGON_MAINNET_URL;
                break;
            case NETWORKS.POLYGON_TESTNET:
                providerUrl = NETWORK_URL.INFURA_POLYGON_TESTNET_URL;
                break;
            default:
                throw new Error("Provided network isn't supported");
        }

        provider = new HDWalletProvider({
            mnemonic: process.env.MNEMONIC || "zebra tooth priority lake lunar spot million habit benefit auto oil oval",
            providerOrUrl: providerUrl
        });

    } catch (error) {
        throw new Error(error.message);
    }
    
    return provider;
}

function generateWeb3Instance(provider){
    return new Promise((resolve, reject) => {
        try {
            resolve(new Web3(provider))
        } catch (error){
            reject(error)
        }
    });
}

const web3 = {
    // LOCAL GANACHE INSTANCE
    ganache(){
        const ganacheNetworkProvider = generateProvider(NETWORKS.GANACHE);
        return generateWeb3Instance(ganacheNetworkProvider)
    },
    // INFURA ETHEREUM NODES
    gorliTestNet(){
        const gorliTestNetProvider = generateProvider(NETWORKS.GORLI);
        return generateWeb3Instance(gorliTestNetProvider)
    },
    rinkebyTestNet(){
        const rinkebyTestNetProvider = generateProvider(NETWORKS.RINKEBY);
        return generateWeb3Instance(rinkebyTestNetProvider)
    },
    kovanTestNet(){
        const kovanTestNetProvider = generateProvider(NETWORKS.KOVAN);
        return generateWeb3Instance(kovanTestNetProvider)
    },
    ropstenTestNet(){
        const kovanTestNetProvider = generateProvider(NETWORKS.ROPSTEN);
        return generateWeb3Instance(kovanTestNetProvider)
    },
    mainNet(){
        const mainNetProvider = generateProvider(NETWORKS.MAINNET);
        return generateWeb3Instance(mainNetProvider);
    },
    // INFURA SIDE CHAIN NODES
    polygonMainNet(){
        const polygonMainNetProvider = generateProvider(NETWORKS.POLYGON_MAINNET);
        return generateWeb3Instance(polygonMainNetProvider);
    },
    polygonTestNet(){
        const polygonTestNetProvider = generateProvider(NETWORKS.POLYGON_TESTNET);
        return generateWeb3Instance(polygonTestNetProvider);
    }
}

module.exports = web3;
