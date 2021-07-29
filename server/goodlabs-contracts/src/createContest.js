const { NETWORKS } = require("../../constants/blockchain");
const { getAccountsForWeb3Instance } = require("../../utils/blockchain");
const web3 = require("../../utils/getWeb3");
const deployedContracts = require("../abi/deployedContracts.json");

async function createContestOnNetwork(network){

    try {
        const web3Instance = await web3[network]();

        const contractKey = `ContestFactory.sol-${network}`;
    
        const { abi , address: contractAddress} = deployedContracts[contractKey];
    
        const accounts = await getAccountsForWeb3Instance(web3Instance);
    
        let contract = new web3Instance.eth.Contract(abi, contractAddress);
    
        await contract.methods.createCampaign("test123", "paulyg", 1000).send({
            from: accounts[0],
        });
    
        return await contract.methods.deployedCampaigns(1).call();
    } catch (error) {
        console.log(error.message);
    }
    
}

async function main(){
    console.log(await createContestOnNetwork(NETWORKS.GORLI))
}

main()