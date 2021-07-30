const fetch = require('node-fetch');
const fs = require('fs');
let deployedContracts = require('../../goodlabs-contracts/abi/deployedContracts');
const web3 = require('../../utils/getWeb3');


async function githubRepoController (req, res) {
    // call transferFunds at the route
    // surround in try/catch
    try {
        const transferInformation = {
            Address,
            RepoName,
            ContractOwnerGithubID,
            Network
        } = req.body;
        
        const providerName = `Contest.sol-${Network}`;
        let contractAmount;
        // abi from deployedContracts.json
        const abi = deployedContracts[providerName].abi;

        // getting contract methods / variables from the contractInstance
        const web3Instance = await web3[Network]();
        const contractInstance = new web3Instance.eth.Contract(abi, Address);

        // contractAmount = await contractInstance.methods.contractAmount().call();
        // console.log(`Before - ${contractAmount}`);
        // calling the transferFunds from the goodlabsAddress 
        let goodlabsAddress = await contractInstance.methods.goodlabsAddress().call();
        
        try {
            const transfer = await contractInstance.methods.transferFunds().send({from: goodlabsAddress});

            let contractAmountAfter;
            // checking if the contractAmount was reset to 0, in which case the transaction was successful
            contractAmountAfter = await contractInstance.methods.contractAmount().call();
            // console.log(`After - ${contractAmountAfter}`);
            let fundsTransferred = false;
            if (contractAmountAfter == 0) {
                fundsTransferred = true;
            }
            else {
                fundsTransferred = false;
            }
            
            if (fundsTransferred) {
                
                // TODO: turn this into a function
                const url =`https://api.github.com/repos/dangvid/${RepoName}/transfer` //owner name needs to be changed to goodlabs github ID
                const authHeader ="token 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" //token needs to be changed to goodlabs auth token
                const new_owner = {
                    new_owner: ContractOwnerGithubID    
                }

                const options = {
                    method: "post",
                    body: JSON.stringify(new_owner),
                    headers: {
                        Accept: "application/vnd.github.v3+json",
                        Authorization: authHeader
                    }
                };

                fetch(url, options)
                    .then( res => res.json() )
                    .then( data => {
                        res.json({ msg: 'Github Repo transfer request was sent.' });
                });
            }
            else {
                res.status(200).json({ msg: 'Funds have not yet been transferred to the leader.' });
            }
        }
        catch(error) {
            res.status(400).json({ msg: 'Funds cannot be transferred until the end time has passed.' });
        }
    }
    catch(error) {
        res.status(400).json({ msg: error.message });
    }

};

module.exports = { githubRepoController };