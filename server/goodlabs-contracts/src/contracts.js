const fs = require("fs");
const path = require("path");

const contracts = require("../abi/deployedContracts.json");

const web3 = require("../../utils/getWeb3");
const deployContract = require("../../utils/deploy");
const { isSupportedNetwork } = require("../../utils/blockchain");
const compileContract = require("../../utils/compile");


async function deployContractToChain(contractName, network, constructorSettings={}, saveAddress=true, gas=4700000, gasPrice=0){
    return new Promise(async (resolve, reject) => {
        if(isSupportedNetwork(network)){
            try {
                const web3Instance = await web3[network]();

                const accounts = await web3Instance.eth.getAccounts();
                const GOODLABS_ADDRESS = accounts[0];

                const gasEstimate = await web3Instance.eth.estimateGas({
                    from: GOODLABS_ADDRESS,
                })
            
                const contractPath = path.resolve(__dirname, "..", "smart-contracts", contractName);    
                
                const contractId = `${contractName}-${network}`
                
                let contractData;

                if(contractName === "ContestFactory.sol"){

                    const { contract, abi } = await deployContract(
                        web3Instance, 
                        contractPath, 
                        GOODLABS_ADDRESS,
                        constructorSettings, 
                        gas,
                        gasPrice || gasEstimate
                    );

                    contractData = {
                        abi,
                        address: contract._address
                    };
                } else if(contractName === "Contest.sol"){

                    const {abi, _} = compileContract(contractPath);

                    contractData = {
                        abi
                    };
                }
    
                contracts[contractId] = contractData;
                
                fs.writeFileSync(path.resolve(__dirname, "..", "abi", "deployedContracts.json"), JSON.stringify(contracts, null, 4), 'utf8');
    
                resolve(contractData);

            } catch (error) {
                reject(error.message);
            }
        } 

        reject(new Error("Network specified is not supported"))
    });
}

async function main(){
    console.log(await deployContractToChain("ContestFactory.sol", "gorliTestNet"));
    console.log(await deployContractToChain("Contest.sol", "gorliTestNet"));
}

main()