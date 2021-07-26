const Web3 = require("web3");
const ganache = require("ganache-cli");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const dotenv = require('dotenv');

dotenv.config();

function generateProvider(providerUrl){

    let provider;

    try {
        provider = new HDWalletProvider({
            mnemonic: process.env.MNEMONIC || "zebra tooth priority lake lunar spot million habit benefit auto oil oval",
            providerOrUrl: providerUrl
        });

    } catch (error) {
        throw new Error("Error generating provider with provided arguments");
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
        return generateWeb3Instance(ganache.provider())
    },
    // INFURA ETHEREUM NODES
    gorliTestNet(){
        const gorliTestNetProvider = generateProvider(process.env.INFURA_GORLI_URL);
        return generateWeb3Instance(gorliTestNetProvider)
    },
    rinkebyTestNet(){
        const rinkebyTestNetProvider = generateProvider(process.env.INFURA_RINKEBY_URL);
        return generateWeb3Instance(rinkebyTestNetProvider)
    },
    kovanTestNet(){
        const kovanTestNetProvider = generateProvider(process.env.INFURA_KOVAN_URL);
        return generateWeb3Instance(kovanTestNetProvider)
    },
    ropstenTestNet(){
        const kovanTestNetProvider = generateProvider(process.env.INFURA_ROPSTEN_URL);
        return generateWeb3Instance(kovanTestNetProvider)
    },
    mainNet(){
        const mainNetProvider = generateProvider(process.env.INFURA_MAINNET_URL);
        return generateWeb3Instance(mainNetProvider);
    },
    // INFURA SIDE CHAIN NODES
    polygonMainNet(){
        const polygonMainNetProvider = generateProvider(process.env.INFURA_POLYGON_MAINNET_URL);
        return generateWeb3Instance(polygonMainNetProvider);
    },
    polygonTestNet(){
        const polygonTestNetProvider = generateProvider(process.env.INFURA_POLYGON_TESTNET_URL);
        return generateWeb3Instance(polygonTestNetProvider);
    }
}

module.exports = web3;
