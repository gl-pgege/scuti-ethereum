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


describe("Testing constructor", function(){
  let contract;
  let accounts;
  beforeEach(async function() {
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
  })
  it("Checking owner", async function() {
    const ownerAddress = await contract.methods.owner;
    assert(accounts[0], ownerAddress, "account[0] not equal to the owner address.")
  })
  it("leaderScore is 100", async function(){
    const leaderScore = await contract.methods.leaderScore().call();
    assert(leaderScore, 100, "leaderScore should be 100.");
    // assert(contractAmount == 1000, "contractAmount is equal to 1000");
  })
  it("Current leader is address(0)", async function() {
    const leaderAddress = await contract.methods.leaderAddress;
    const addressZero = await contract.methods.addressZero;
    assert(leaderAddress, addressZero, "Leader address should be null");
  })
  it("Contract amount is 1000", async function() {
    const contractAmount = await contract.methods.contractAmount;
    assert(contractAmount, 1000, "Contract amount should equal 1000.");
  })
});

describe("Only owner of contract should be able to call beginContract() function", function() {
  let contract;
  let accounts;
  beforeEach(async function() {
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
  })
  it("The owner is able to call beginContract()", async function() {
    const ownerAddress = accounts[0];
    const endTime = await contract.methods.currentTime().call();
    const beginContract = await contract.methods.beginContract(endTime).send({from: ownerAddress, value: 1000});
    const hardcodedEndTime = 1625858389;
    assert(hardcodedEndTime, endTime);
  })
  it("The contract is funded.", async function() {
    const isFunded = await contract.methods.contractFunded;
    assert(isFunded, true);
  })
})

describe("Submissions can only be submitted prior to end time", function() {
  it("The owner is able to call beginContract()", async function() {
    const ownerAddress = accounts[0];
    const submissionAddress = accounts[1];
    const endTime = 1825859393; 
    const beginContract = await contract.methods.beginContract(endTime).send({from: ownerAddress, value: 1000});
    const contractSubmit = await contract.methods.contractSubmission(50).send({from: submissionAddress});
    //assert
  })
})
/*
describe("Non owner cannot call beginContract()", function() {
  let contract;
  let accounts;
  beforeEach(async function() {
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
  })
  it("The owner is able to call beginContract()", async function() {
    const nonOwner = accounts[1];
    const endTime = await contract.methods.currentTime().call();
    const beginContract = await contract.methods.beginContract(endTime).send({from: nonOwner, value: 1000});
    const hardcodedEndTime = 1625858389;
    assert(hardcodedEndTime, endTime, "Should fail because only owner can call beginContract()");
  })
})




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