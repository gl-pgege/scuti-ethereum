const { NETWORKS } = require("../constants/blockchain");
const web3 = require("./getWeb3");
const deployedContracts = require("../goodlabs-contracts/abi/deployedContracts.json")


function isSupportedNetwork(networkName){
    switch(networkName){
        case NETWORKS.GANACHE:
        case NETWORKS.GORLI:
        case NETWORKS.KOVAN:
        case NETWORKS.RINKEBY:
        case NETWORKS.ROPSTEN:
        case NETWORKS.MAINNET:
        case NETWORKS.POLYGON_MAINNET:
        case NETWORKS.POLYGON_TESTNET:
            return true;
        default:
            return false;
    }
}

async function getAccountsForWeb3Instance(web3Instance){
    const accounts = await web3Instance.eth.getAccounts();
    return accounts;
}

async function submitDeveloperTestScore(network, contractAddress, score){

    return new Promise(async (resolve, reject) => {
        try{
            if(isSupportedNetwork(network)){
            
                const web3Instance = await web3[network]();
        
                const accounts = await getAccountsForWeb3Instance(web3Instance);
        
                const contractKey = `Contest.sol-${network}`;
        
                const { abi } = deployedContracts[contractKey];
        
                let contract = new web3Instance.eth.Contract(abi, contractAddress);
        
                // TODO: Can query blockchain for current leaderscore and only cal this method when required
                await contract.methods.contractSubmission(score).send({
                    from: accounts[1]
                });
    
                resolve(true);
        
            } else {
                reject(new Error("Specified Network is not supported"));
            }
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    isSupportedNetwork,
    getAccountsForWeb3Instance,
    submitDeveloperTestScore
}