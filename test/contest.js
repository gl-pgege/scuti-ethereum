const path = require('path');
const solc = require('solc');
const ethereumJS = require('web3');
const fs = require('fs');
const Web3 = require('web3');
const ganache = require('ganache-cli');

// instance of Web3
const web3 = new Web3(ganache.provider());

const contractPath = path.resolve(__dirname, '..', 'contracts', 'Contest.sol');

const sourceCode = fs.readFileSync(contractPath, 'utf-8');
//const compiledCode = solc.compile(sourceCode);

//const contestBytecode = compiledCode.contracts[':Contest'].bytecode;
//const contestInterface = JSON.parse(compiledCode.contracts[':Contest'].interface);

var input = {
    language: 'Solidity',
    sources: {
      'Contest.sol': {
        content: sourceCode
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };
   
var output = JSON.parse(solc.compile(JSON.stringify(input)));

const contractObject = output.contracts['Contest.sol'].Contest;

const {abi, evm} = contractObject;

const byteCode = '0x' + evm.bytecode.object;    // 0x for hex



(async function() {
    const accounts = await web3.eth.getAccounts();
    const gasEstimate = await web3.eth.estimateGas({
        from: accounts[0]
    })
    const contract = await new web3.eth.Contract(abi).deploy({
        data: byteCode
    }).send({
        from: accounts[0], 
        gas: 6700000,
        gasPrice: gasEstimate,
        value: 1000
    })
    console.log(contract);
})()

//console.log(evm.bytecode.object);
/*
const web3 = new ethereumJS('http://localhost:8545');

// accounts
web3.eth.getAccounts().then(function(result) { 
accounts = result;
})


const contestContract = new web3.eth.Contract(contestInterface);

//deploy
contestContract.deploy({
    data: contestBytecode,
    arguments: [accounts[0], 1000]
}).send({
    from: accounts[0], 
    gas: 400000
}).then((myContract) => {contestContract.options.address = myContract.options.address});
*/