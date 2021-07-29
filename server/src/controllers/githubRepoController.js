const path = require('path');
const fs = require('fs');
const Web3 = require('web3');

async function githubRepoController (req, res) {

    



    // const web3 = new Web3(ganache.provider());

    // const contractPath = path.resolve(__dirname, '..', '..', 'goodlabs-contracts', 'smart-contracts', 'Contest.sol');
    
    // const sourceCode = fs.readFileSync(contractPath, 'utf-8');

    // var input = {
    //     language: 'Solidity',
    //     sources: {
    //     'Contest.sol': {
    //         content: sourceCode
    //     }
    //     },
    //     settings: {
    //     outputSelection: {
    //         '*': {
    //         '*': ['*']
    //         }
    //     }
    //     }
    // };
    
    // var output = JSON.parse(solc.compile(JSON.stringify(input)));

    // const contractObject = output.contracts['Contest.sol'].Contest;

    // const {abi, evm} = contractObject;

    // const byteCode = '0x' + evm.bytecode.object;    // 0x for hex

    // const setContractAmount = 1000000000000000;

    // const compileCode = async() => {
    //     try {
    //         const accounts = await web3.eth.getAccounts();
    //         const gasEstimate = await web3.eth.estimateGas({
    //             from: accounts[0]
    //         })
    //         const contract = await new web3.eth.Contract(abi).deploy({
    //             data: byteCode,
    //             arguments: [accounts[0], setContractAmount, accounts[9]]    // setting accounts[9] to goodlabs
    //         }).send({
    //             from: accounts[0], 
    //             gas: 6700000,
    //             gasPrice: gasEstimate
    //         })
    //         return contract;
    //     }
    //     catch(error) {
    //         console.log(error.message);
    //     }
    // };
    
    // let contract;
    // let accounts;
    // let ownerAddress;
    // let leaderAddress;
    // let score;
    // let endTime;
    // let beginContract;
    // let contractSubmission;
    // let goodlabsAddress;
    // let transfer;
    // (async function() {
    //     contract = await compileCode();
    //     accounts = await web3.eth.getAccounts();
    //     ownerAddress = accounts[0];
    //     leaderAddress = accounts[1];
    //     goodlabsAddress = accounts[9];
    //     endTime = parseInt(await contract.methods.currentTime().call()) + 3; 
    //     beginContract = await contract.methods.beginContract(endTime).send({from: ownerAddress, value: setContractAmount});
    //     score = 60; // to ensure leader address is updated
    //     contractSubmission = await contract.methods.contractSubmission(score).send({from: leaderAddress});
    //     // console.log(goodlabsAddress);
    //     // web3.eth.getBalance(leaderAddress).then(console.log);
    //     transfer = await contract.methods.transferFunds().send({from: goodlabsAddress});
    //     // web3.eth.getBalance(leaderAddress).then(console.log);
        


    // })();

};

module.exports = { githubRepoController };