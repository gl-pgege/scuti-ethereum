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


describe("Constructor", function(){
  let contract;
  let accounts;
  before(async function() {
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
  })
  it("The owner address is correct.", async function() {
    const ownerAddress = await contract.methods.owner;
    assert(accounts[0], ownerAddress, "account[0] not equal to the owner address.")
  })
  it("leaderScore is initialized to 100", async function(){
    const leaderScore = await contract.methods.leaderScore().call();
    assert(leaderScore, 100, "leaderScore should be 100.");
    // assert(contractAmount == 1000, "contractAmount is equal to 1000");
  })
  it("Current leader is initialized to address(0)", async function() {
    const leaderAddress = await contract.methods.leaderAddress;
    const addressZero = await contract.methods.addressZero;
    assert(leaderAddress, addressZero, "Leader address should be null");
  })
  it("Contract amount is initialized to 1000", async function() {
    const contractAmount = await contract.methods.contractAmount;
    assert(contractAmount, 1000, "Contract amount should equal 1000.");
  })
});
  

describe("Testing the beginContract() function", function(){
  let contract;
  let accounts;
  before(async function() {
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
  })
  // beginContract()
  it("The owner is able to call beginContract()", async function() {
    const ownerAddress = accounts[0];
    const endTime = await contract.methods.currentTime().call();
    const beginContract = await contract.methods.beginContract(endTime).send({from: ownerAddress, value: 1000});
    const hardcodedEndTime = 1625858389;
    assert(hardcodedEndTime, endTime);
  })
  it("The owner is able to call beginContract(), but must provide the correct contract value. (value too low)", async function() {
    const ownerAddress = accounts[0];
    const endTime = await contract.methods.currentTime().call();
    const beginContract = await contract.methods.beginContract(endTime).send({from: ownerAddress, value: 999});
    const hardcodedEndTime = 1625858389;
    assert.fail("Incorrect contract amount - should be 1000.");
  })
  it("The owner is able to call beginContract(), but must provide the correct contract value. (value too high)", async function() {
    const ownerAddress = accounts[0];
    const endTime = await contract.methods.currentTime().call();
    const beginContract = await contract.methods.beginContract(endTime).send({from: ownerAddress, value: 1001});
    const hardcodedEndTime = 1625858389;
    assert.fail("Incorrect contract amount - should be 1000.");
  })
  // non owner should not be able to call beginContract()
  it("Anyone else is not able to call beginContract() (with correct contract value).", async function() {
    const nonOwner = accounts[1];
    const endTime = await contract.methods.currentTime().call();
    const beginContract = await contract.methods.beginContract(endTime).send({from: nonOwner, value: 1000});
    const hardcodedEndTime = 1625858389;
    assert.fail("Only the owner is able to call the function.");
  })
  it("Anyone else is not able to call beginContract() (with incorrect contract value).", async function() {
    const nonOwner = accounts[1];
    const endTime = await contract.methods.currentTime().call();
    const beginContract = await contract.methods.beginContract(endTime).send({from: nonOwner, value: 900});
    const hardcodedEndTime = 1625858389;
    assert.fail("Only the owner is able to call the function.");
  })
  it("The owner must provide an end time.", async function() {
    const ownerAddress = accounts[0];
    const beginContract = await contract.methods.beginContract().send({from: ownerAddress, value: 1000});
    assert.fail("Owner must provide an end time.");
  })
  it("The contract is funded when we call beginContract(). (isFunded = true)", async function() {
    const isFunded = await contract.methods.contractFunded;
    assert(isFunded, true);
  })
  it("Contract amount is set to the correct amount when we call beginContract().", async function() {
    const contractAmount = await contract.methods.contractAmount;
    assert(contractAmount, 1000)
  })
});

describe("contractSubmission()", function() { 
  let contract;
  let accounts;
  before(async function() {
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
    const ownerAddress = accounts[0];
    const endTime = 1726110128; // hard coded end time 
    const beginContract = await contract.methods.beginContract(endTime).send({from: ownerAddress, value: 1000});
  })
  it("contractSubmission() - only non owner can call and the score is updated if submitted score is below current leaderscore (submitted score is lower, so leaderScore is updated)", async function() {
    const nonOwner = accounts[1];
    const score = 50;
    const contractSubmission = await contract.methods.contractSubmission(score).send({from: nonOwner});
    const leaderScore = await contract.methods.leaderScore;
    assert(leaderScore, 50);  
    const leaderAddress = await contract.methods.leaderAddress;
    assert(leaderAddress, nonOwner);
  })
  it("contractSubmission() - only non owner can call and the score is updated if submitted score is below current leaderscore (submitted score is higher, so leaderScore is not updated)", async function() {
    const nonOwner = accounts[1];
    const score = 105;
    const contractSubmission = await contract.methods.contractSubmission(score).send({from: nonOwner});
    const leaderScore = await contract.methods.leaderScore;
    assert.notEqual(leaderScore, 105);  
    const leaderAddress = await contract.methods.leaderAddress;
    assert.notEqual(leaderAddress, nonOwner);
  })
  it("Owner cannot call contractSubmission()", async function() {
    const owner = accounts[0];
    const score = 60;
    const contractSubmission = await contract.methods.contractSubmission(score).send({from: owner});
    const leaderScore = await contract.methods.leaderScore;
    assert.fail(leaderScore, 60);  
  })
  it("contractSubmission() requires a score to be passed", async function() {
    const nonOwner = accounts[1];
    const contractSubmission = await contract.methods.contractSubmission().send({from: nonOwner});
    const leaderScore = await contract.methods.leaderScore;
    assert.fail(leaderScore, 60, "Non-owner must pass a score as a parameter.");  
  })
});

describe("Testing contractSubmission() end time", function() { 
  let contract;
  let accounts;
  before(async function() {
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
    const ownerAddress = accounts[0];
    const endTime = 1526110128; // this time is in the past
    const beginContract = await contract.methods.beginContract(endTime).send({from: ownerAddress, value: 1000});
  })
  it("contractSubmission() must be called by a non-owner before the end time", async function() {
    const nonOwner = accounts[1];
    const score = 60;
    const contractSubmission = await contract.methods.contractSubmission(score).send({from: nonOwner});
    assert.fail("contractSubmission() must be called before the end time!")
  })
});

describe("contractSubmission() requires beginContract() to be called first", function() { 
  let contract;
  let accounts;
  before(async function() {
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
    const ownerAddress = accounts[0];
  })
  // beginContract() is not called and so contractFunded = false
  it("contractSubmission() requires beginContract() to be called first, so that contractFunded = true", async function() {
    const nonOwner = accounts[1];
    const score = 60;
    const contractSubmission = await contract.methods.contractSubmission(score).send({from: nonOwner});
    assert.fail("contractFunded = false");
  })
});

describe("winnerWithdrawal()", function() { 
  let contract;
  let accounts;
  let ownerAddress;
  let leaderAddress;
  let endTime;
  let beginCOntract;
  let score;
  let contractSubmission;
  beforeEach(async function() {
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
    wnerAddress = accounts[0];
    eaderAddress = accounts[1];
    endTime = await contract.methods.currentTime();
    beginContract = await contract.methods.beginContract(endTime).send({from: ownerAddress, value: 1000});
    score = 60;
    contractSubmission = await contract.methods.contractSubmission(score).send({from: leaderAddress});
  })
  // beginContract() is not called and so contractFunded = false
  it("winnerWithdrawal() can only be called by leader, after the end time", async function() {
    
    assert.fail("contractFunded = false");
  })
});


// unit tests
// use try catch to go over failures, so that the tests dont stop
// in the catch block make sure values havent changed and then assert that the values havent changed


//
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