function searchDeployedContracts(nameOfContract, deployedContracts, res) {
    var contractFound = false;
    var contractIndex;
    const CONTESTFACTORY = 'ContestFactory.sol';
    const CONTEST = 'Contest.sol';
    
    // iterates through each deployed contract in the deployedContracts.json file, searches for matching name
    for (var deployedName in deployedContracts) {
        if (nameOfContract === deployedName) {
            contractFound = true;
            contractIndex = deployedContracts[nameOfContract];
            break;
        }
    }
    if (contractFound) {
        if (ContestName == CONTESTFACTORY) {
            return res.status(200).json(contractIndex);
        }
        else if (ContestName == CONTEST) {
            return res.status(200).json(contractIndex.abi);
        }
        else {  
            return res.status(200).json({ msg: "Contract name must be ContestFactory.sol or Contest.sol." });
        }
    }
    else {
        return res.status(200).json({ msg: `No such contract with the name ${nameOfContract}` });
    }
}

module.exports = { searchDeployedContracts };