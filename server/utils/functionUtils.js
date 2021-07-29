function searchDeployedContracts(nameOfContract, deployedContracts, res) {
    var contractFound = false;
    var contractIndex = 0;
    const CONTESTFACTORY = 'ContestFactory.sol';
    const CONTEST = 'Contest.sol';
    
    // iterates through each deployed contract in the deployedContracts.json file, searches for matching name
    for (var i in deployedContracts) {
        var deployedName = (Object.keys(deployedContracts[i])).toString();
        if (nameOfContract === deployedName) {
            contractFound = true;
            contractIndex = i;
            break;
        }
    }
    if (contractFound) {
        if (ContestName == CONTESTFACTORY) {
            return res.status(200).json(deployedContracts[contractIndex][nameOfContract]);
        }
        else if (ContestName == CONTEST) {
            return res.status(200).json(deployedContracts[contractIndex][nameOfContract].abi);
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