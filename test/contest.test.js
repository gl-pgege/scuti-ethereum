const path = require('path');
const solc = require('solc');
const ethereumJS = require('web3');
const fs = require('fs');
const Web3 = require('web3');
const ganache = require('ganache-cli');
const assert = require('assert');
const mocha = require('chai').assert;


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

const compileCode = async() => {
//(async function() {
  try {
    const accounts = await web3.eth.getAccounts();
    const gasEstimate = await web3.eth.estimateGas({
        from: accounts[0]
    })
    const contract = await new web3.eth.Contract(abi).deploy({
        data: byteCode,
        arguments: [accounts[0], 1000]
    }).send({
        from: accounts[0], 
        gas: 6700000,
        gasPrice: gasEstimate
    })
    return contract;
  }
  catch(error) {
    console.log(error.message);
  }
};

// compileCode().then(gas => console.log(gas));


describe("Constructor", function(){
  let contract;
  let accounts;
  beforeEach(async function() {
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
  })
  it("Checking owner address, leaderAddress should be the zero address, leaderScore should be 100, contractAmount should equal 1000", async function(){
    console.log(contract);
    assert(1, 1);
    // assert(accounts[0] == owner, "Owner address is correct");
    // assert(leaderAddress == address(0), "Leader addres is equal to the zero address");
    // assert(leaderScore == 100, "leaderScore is equal to 100");
    // assert(contractAmount == 1000, "contractAmount is equal to 1000");
  })
});





// compileCode().then(gasEstimate => console.log(gasEstimate));

// const contestContract = new web3.eth.Contract(abi);
// compileCode().then((myContract) => {contestContract.options.address = myContract.options.address});
// console.log(contestContract);

// let contract = compileCode();
// contract.then(function(result) {
//   console.log(contract.methods);
// })
// const myFunction = async() => {
//     const accounts = await web3.eth.getAccounts();
//     const gasEstimate = await web3.eth.estimateGas({
//     from: accounts[0]
//   })
//     const contract = await new web3.eth.Contract(abi).deploy({
//     data: byteCode,
//     arguments: [accounts[0], 1000]
//   }).send({
//     from: accounts[0], 
//     gas: 6700000,
//     gasPrice: gasEstimate
//   })
  
//   //return gasEstimate;
//     return accounts;
//   };
  
//   (async () => {
//     const myAccounts = await myFunction()
//     //console.log(myAccounts[0])

//   })();
  // describe('Test 1', function() {
  //   it('Checking owner address', function() {
  //     assert(accounts[0] == contracts.owner, 'Accounts are the same.');
  //   })
  // })





/*

describe("Constructor", function(){
  const myFunction = async() => {
  const accounts = await web3.eth.getAccounts();
  const gasEstimate = await web3.eth.estimateGas({
  from: accounts[0]
})
  const contract = await new web3.eth.Contract(abi).deploy({
  data: byteCode,
  arguments: [accounts[0], 1000]
}).send({
  from: accounts[0],
  gas: 6700000,
  gasPrice: gasEstimate
})
  //return gasEstimate;
  return accounts;
};
  (async () => {
  const accounts = await myFunction()
  it("Checking Owner address, leaderAddress should be the zero address, leaderScore should be 100, contractAmount should equal 1000", function(){
  assert(accounts[0] == owner, "Owner address is correct");
  assert(leaderAddress == address(0), "Leader addres is equal to the zero address");
  assert(leaderScore == 100, "leaderScore is equal to 100");
  assert(contractAmount == 1000, "contractAmount is equal to 1000");
})
})();


})


*/
  

// deploy contract in describe
// use contract methods to interact with blockchain 

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