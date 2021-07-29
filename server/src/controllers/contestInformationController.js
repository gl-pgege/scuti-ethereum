const deployedContracts = require('../../goodlabs-contracts/abi/deployedContracts.json');
const { searchDeployedContracts } = require('../../utils/functionUtils');

async function contestInformationController (req, res) {
    try {
        var contestInfo = {
            ContestName,        // ContestFactory.sol or Contest.sol
            ProviderName        // ganache, gorli, kovan, rinkeby, ropsten, mainnet, polygon_mainnet, polygon_testnet
        } = req.body;
        var nameOfContract = `${ContestName}-${ProviderName}`;
    
        searchDeployedContracts(nameOfContract, deployedContracts, res);

    }
    catch(error) {
        res.status(400).json({ msg: error.message });
    }
}

module.exports = { contestInformationController };