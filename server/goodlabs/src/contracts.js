const fs = require("fs");
const path = require("path");

const contracts = require("../deployedContracts.json");

const web3 = require("../../utils/getWeb3");
const deployContract = require("../../utils/deploy");
const { NETWORKS } = require("../../utils/constants");


async function deployContractToChain(contractName, network, constructorSettings={}, saveAddress=true){
    
    switch(network){
        case NETWORKS.GANACHE:
        case NETWORKS.GORLI:
        case NETWORKS.KOVAN:
        case NETWORKS.RINKEBY:
        case NETWORKS.ROPSTEN:
        case NETWORKS.MAINNET:
        case NETWORKS.POLYGON_MAINNET:
        case NETWORKS.POLYGON_TESTNET:
            try {
                const web3Instance = await web3[network]();
            
                const contractPath = path.resolve(__dirname, "..", "smart-contracts", contractName);
    
                const accounts = await web3Instance.eth.getAccounts();
                const GOODLABS_ADDRESS = accounts[0];
    
                const { contract, abi } = await deployContract(
                    web3Instance, 
                    contractPath, 
                    GOODLABS_ADDRESS,
                    constructorSettings, 
                );
                
                const index = `${contractName}-${network}`

                contracts[index] = {
                    abi,
                    address: contract._address
                };
                
                fs.writeFileSync('../deployedContracts.json', JSON.stringify(contracts, null, 4), 'utf8');

            } catch (error) {
                console.log(error);
            }
            
            break;

        default:
            console.log("Wrong network");
    }
}

async function main(){
    console.log(await deployContractToChain("ContestFactory.sol", "ganache"));
}

main()