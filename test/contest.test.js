const path = require('path');
const solc = require('solc');
const ethereumJS = require('web3');
const fs = require('fs');
const Web3 = require('web3');
const ganache = require('ganache-cli');
const chai = require('chai')
, assert = chai.assert
, expect = chai.expect
, should = chai.should()


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

const setContractAmount = 1000000000000000;

const compileCode = async() => {
//(async function() {
  try {
    const accounts = await web3.eth.getAccounts();
    const gasEstimate = await web3.eth.estimateGas({
        from: accounts[0]
    })
    const contract = await new web3.eth.Contract(abi).deploy({
        data: byteCode,
        arguments: [accounts[0], setContractAmount]  // this changes
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

// todo: change all getters 
describe("Constructor", function(){
  let contract;
  let accounts;
  before(async function() {
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
  })
  it("Owner address.", async function() {
    const ownerAddress = await contract.methods.owner().call();
    expect(ownerAddress).to.equal(accounts[0]);
  })
  it("leaderScore is initialized to 100", async function(){
    const leaderScore = parseInt(await contract.methods.leaderScore().call());
    expect(leaderScore).to.equal(100);
    expect(leaderScore).to.be.a('number');
  })
  it("Current leader is initialized to address(0)", async function() {
    const leaderAddress = await contract.methods.leaderAddress().call();
    const addressZero = await contract.methods.getAddressZero().call();
    expect(leaderAddress).to.equal(addressZero);
  })
  it("Contract amount is initialized to setContractAmount", async function() {
    const contractAmount = parseInt(await contract.methods.contractAmount().call());
    expect(contractAmount).to.equal(setContractAmount);
    expect(contractAmount).to.be.a('number');
  })
});
  

describe("Testing the beginContract() function", function(){
  let contract;
  let accounts;
  before(async function() {
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
  })
  it("The owner is able to call beginContract(), and must provide the correct contract value [setContractAmount]", async function() {
    const ownerAddress = await contract.methods.owner().call();    // the same as accounts[0]
    const endTime = await contract.methods.currentTime().call();
    const beginContract = await contract.methods.beginContract(endTime).send({from: ownerAddress, value: setContractAmount});  // changing this fails the test
    const isFunded = await contract.methods.contractFunded().call();
    const contractValue = parseInt(await contract.methods.contractAmount().call());
    expect(contractValue).to.equal(setContractAmount);    // contract value must be setContractAmount -- fails if the contract value is different than the initialized value (setContractAmount in this case)
    expect(isFunded).to.equal(true);    // isFunded is true only if beginContract() was successfully called
  })
  it("Anyone else is not able to call beginContract()", async function() {
    expect.fail("This test fails as only the owner can call beginContract()");
    const nonOwner = accounts[1];
    const endTime = await contract.methods.currentTime().call();
    const beginContract = await contract.methods.beginContract(endTime).send({from: nonOwner, value: setContractAmount});
  })
  it("The owner must provide an end time.", async function() {
    expect.fail("The owner must provide an end time!");
    const ownerAddress = accounts[0];
    const beginContract = await contract.methods.beginContract().send({from: ownerAddress, value: setContractAmount});
  })
  it("The contract is funded when beginContract() is called", async function() {
    const isFunded = await contract.methods.contractFunded().call();
    expect(isFunded).to.equal(true);
  })
  it("Contract amount is set to the correct amount when we call beginContract() [setContractAmount].", async function() {
    const contractValue = parseInt(await contract.methods.contractAmount().call());
    expect(contractValue).to.equal(setContractAmount);
  })
});

describe("Testing the contractSubmission() function", function() { 
  let contract;
  let accounts;
  beforeEach(async function() {
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
    const ownerAddress = accounts[0];
    const endTime = 1726110128; // hard coded end time in the future
    const beginContract = await contract.methods.beginContract(endTime).send({from: ownerAddress, value: setContractAmount});
  })
  it("contractSubmission() - only non owner can call and the score is updated if submitted score is below current leaderscore (submitted score is lower, so leaderScore and leaderAddress is updated)", async function() {
    const nonOwner = accounts[1];   // changing this to accounts[0] will fail the test
    const score = 50;   // lower score
    const contractSubmission = await contract.methods.contractSubmission(score).send({from: nonOwner});
    const leaderScore = parseInt(await contract.methods.leaderScore().call());
    expect(leaderScore).to.equal(score);
    const leaderAddress = await contract.methods.leaderAddress().call();
    expect(leaderAddress).to.equal(nonOwner);
  })
  it("contractSubmission() - only non owner can call and the score is updated if submitted score is below current leaderscore (submitted score is higher, so leaderScore and leaderAddress is NOT updated)", async function() {
    const nonOwner = accounts[1];  
    const score = 105;   // higher score
    const contractSubmission = await contract.methods.contractSubmission(score).send({from: nonOwner});
    const leaderScore = parseInt(await contract.methods.leaderScore().call());
    expect(leaderScore).to.not.equal(score);    // leaderscore should not be updated
    expect(leaderScore).to.equal(100);
    const leaderAddress = await contract.methods.leaderAddress().call();
    expect(leaderAddress).to.not.equal(nonOwner);  // leader address should not be updated
  })
  it("3rd account with lower score submitted should be new leader", async function() {
    const owner = accounts[0];
    const firstAccount = accounts[1];  
    const secondAccount = accounts[2];
    const firstScore = 60;   // lower score = new leader
    const firstContractSubmission = await contract.methods.contractSubmission(firstScore).send({from: firstAccount});
    //let leaderScore = parseInt(await contract.methods.getLeaderScore().call()); // should = 60 at this point
    const secondScore = 50;
    const secondContractSubmission = await contract.methods.contractSubmission(secondScore).send({from: secondAccount});
    let leaderScore = parseInt(await contract.methods.leaderScore().call()); // should = 50 at this point
    expect(leaderScore).to.equal(secondScore);    // leaderScore should = 50 (2nd account) and should be new leader
    const leaderAddress = await contract.methods.leaderAddress().call();
    expect(leaderAddress).to.equal(secondAccount);  // leader address should be second accounts
  })
  it("3rd account with higher score submitted should not affect leader", async function() {
    const owner = accounts[0];
    const firstAccount = accounts[1];  
    const secondAccount = accounts[2];
    const firstScore = 60;   // lower score = new leader
    const firstContractSubmission = await contract.methods.contractSubmission(firstScore).send({from: firstAccount});
    //let leaderScore = parseInt(await contract.methods.getLeaderScore().call()); // should = 60 at this point
    const secondScore = 80;
    const secondContractSubmission = await contract.methods.contractSubmission(secondScore).send({from: secondAccount});
    let leaderScore = parseInt(await contract.methods.leaderScore().call()); // should = 50 at this point
    expect(leaderScore).to.equal(firstScore);
    const leaderAddress = await contract.methods.leaderAddress().call();
    expect(leaderAddress).to.equal(firstAccount);  // leader address should be second accounts
  })
  it("Owner cannot call contractSubmission()", async function() {
    expect.fail("The owner is not able to call contractSubmission()");
    const owner = accounts[0];  
    const score = 60;
    const contractSubmission = await contract.methods.contractSubmission(score).send({from: owner});
  })
  it("contractSubmission() requires a score to be passed", async function() {
    expect.fail("A score must be passed as a parameter.");
    const nonOwner = accounts[1];
    const contractSubmission = await contract.methods.contractSubmission().send({from: nonOwner});  // no score sent
    const leaderScore = await contract.methods.getLeaderScore().call();
  })
});

describe("Testing contractSubmission() end time", function() { 
  let contract;
  let accounts;
  beforeEach(async function() {
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
  })
  it("contractSubmission() must be called by a non-owner before the end time", async function() {
    expect.fail("contractSubmission() must be called before the end time.");
    const ownerAddress = accounts[0];
    const endTime = parseInt(await contract.methods.currentTime().call());
    const beginContract = await contract.methods.beginContract(endTime).send({from: ownerAddress, value: setContractAmount});
    const nonOwner = accounts[1];
    const score = 60;
    const contractSubmission = await contract.methods.contractSubmission(score).send({from: nonOwner});
  })
});

describe("contractSubmission() requires beginContract() to be called first", function() { 
  let contract;
  let accounts;
  beforeEach(async function() {
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
  })
  it("contractSubmission() can be called by anyone but the owner after beginContract() is called.", async function() {
    expect.fail("beginContract() must be called first");
    const nonOwner = accounts[1];   // changing this to accounts[0] will fail the test
    const score = 50;   // lower score
    const contractSubmission = await contract.methods.contractSubmission(score).send({from: nonOwner});
  })
});

describe("Testing the winnerWithdrawal() function", function() {
  this.timeout(10000);  // sets max timeout to 10000ms
  let contract;
  let accounts;
  let ownerAddress;
  let leaderAddress;
  let score;
  let endTime;
  let beginContract;
  let contractSubmission;
  before(async function() {
    // requires entire contract to be started, and a submission to set the leader
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
    ownerAddress = accounts[0];
    leaderAddress = accounts[1];
    endTime = parseInt(await contract.methods.currentTime().call()) + 3; // changing this to longer than the timeout time will fail
    web3.eth.getBalance(ownerAddress).then(console.log);  // balance of owner before beginContract
    beginContract = await contract.methods.beginContract(endTime).send({from: ownerAddress, value: setContractAmount});
    score = 60; // to ensure leader address is updated
    contractSubmission = await contract.methods.contractSubmission(score).send({from: leaderAddress});
    web3.eth.getBalance(leaderAddress).then(console.log);
  });
  beforeEach(function(done) {     // removing time delay will cause a fail in the test
    setTimeout(function() {
      done();
    }, 5000);
  });
  it("winnerWithdrawal() can only be called after beginContract(), and after the end time", async function(){
    const withdraw = await contract.methods.winnerWithdrawal().send({from: leaderAddress});
    const contractValue = parseInt(await contract.methods.contractAmount().call());
    expect(contractValue).to.equal(0);
    expect(await contract.methods.contractFunded().call()).to.equal(false);   // contract no longer funded after withdrawal
    expect(parseInt(await contract.methods.leaderScore().call())).to.equal(100); //leader score should be reset to 100
    expect(await contract.methods.leaderAddress().call()).to.equal(await contract.methods.getAddressZero().call());  //leader address is reset to address(0)

    web3.eth.getBalance(ownerAddress).then(console.log);
    web3.eth.getBalance(leaderAddress).then(console.log);
  });
  it("Non-leader cannot call winnerWithdrawal()", async function(){
    expect.fail("Only the leader can withdraw")
    const nonLeaderAddress = accounts[2];
    const withdraw = await contract.methods.winnerWithdrawal().send({from: nonLeaderAddress});
    const contractValue = parseInt(await contract.methods.contractAmount().call());
  });
});

describe("Testing the winnerWithdrawal() function", function() {
  let contract;
  let accounts;
  let ownerAddress;
  let leaderAddress;
  let score;
  let endTime;
  let beginContract;
  let contractSubmission;
  before(async function() {
    // requires entire contract to be started, and a submission to set the leader
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
    ownerAddress = accounts[0];
    leaderAddress = accounts[1];
    endTime = parseInt(await contract.methods.currentTime().call()) + 3; // changing this to longer than the timeout time will fail
    beginContract = await contract.methods.beginContract(endTime).send({from: ownerAddress, value: setContractAmount});
    score = 60; // to ensure leader address is updated
    contractSubmission = await contract.methods.contractSubmission(score).send({from: leaderAddress});
  });
  it("winnerWithdrawal() cannot be called before the end time", async function(){
    expect.fail("Cannot withdraw before the end time")
    const withdraw = await contract.methods.winnerWithdrawal().send({from: leaderAddress});
    const contractValue = parseInt(await contract.methods.contractAmount().call());
  });
});

describe("Testing the ownerWithdrawal() function", function() {
  this.timeout(10000);  // sets max timeout to 10000ms
  let contract;
  let accounts;
  let ownerAddress;
  let endTime;
  let beginContract;
  before(async function() {
    // requires entire contract to be started, and a submission to set the leader
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
    ownerAddress = accounts[0];
    endTime = parseInt(await contract.methods.currentTime().call()) + 3; // changing this to longer than the timeout time will fail
    web3.eth.getBalance(ownerAddress).then(console.log);  // balance of owner before beginContract
    beginContract = await contract.methods.beginContract(endTime).send({from: ownerAddress, value: setContractAmount});
    web3.eth.getBalance(ownerAddress).then(console.log);
  });
  beforeEach(function(done) {     // removing time delay will cause a fail in the test
    setTimeout(function() {
      done();
    }, 5000);
  });
  it("ownerWithdrawal() can only be called by owner, after the end time, with no submissions", async function(){
    const ownerWithdraw = await contract.methods.ownerWithdrawal().send({from: ownerAddress});
    const contractValue = parseInt(await contract.methods.contractAmount().call());
    expect(contractValue).to.equal(0);
    expect(await contract.methods.contractFunded().call()).to.equal(false);   // contract no longer funded after withdrawal
    expect(await contract.methods.leaderAddress().call()).to.equal(await contract.methods.getAddressZero().call());    // leader address should = zero address
    web3.eth.getBalance(ownerAddress).then(console.log);  // balance goes back up
  });
  it("Non-owners cannot call ownerWithdrawal()", async function(){
    expect.fail("Non-owners of the contract cannot call ownerWithdrawal()")
    const nonOwner = accounts[1];
    const ownerWithdraw = await contract.methods.ownerWithdrawal().send({from: nonOwner});
  });
});

describe("Testing the ownerWithdrawal() function (time)", function() {
  this.timeout(10000);  // sets max timeout to 10000ms
  let contract;
  let accounts;
  let ownerAddress;
  let endTime;
  let beginContract;
  before(async function() {
    // requires entire contract to be started, and a submission to set the leader
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
    ownerAddress = accounts[0];
    endTime = parseInt(await contract.methods.currentTime().call()) + 10000000000000; // 
    web3.eth.getBalance(ownerAddress).then(console.log);  // balance of owner before beginContract
    beginContract = await contract.methods.beginContract(endTime).send({from: ownerAddress, value: setContractAmount});
    web3.eth.getBalance(ownerAddress).then(console.log);
  });
  beforeEach(function(done) {     // removing time delay will cause a fail in the test
    setTimeout(function() {
      done();
    }, 5000);
  });
  it("Owner cannot call ownerWithdrawal() before end time", async function(){
    expect.fail("Owner cannot call ownerWithdrawal() before the end time")
    const ownerWithdraw = await contract.methods.ownerWithdrawal().send({from: ownerAddress});
  });
});

// try to use boolean flag instead of time delay
// csv/json for expect parameters

describe("Testing the ownerWithdrawal() function with a submission", function() {
  this.timeout(10000);  // sets max timeout to 10000ms
  let contract;
  let accounts;
  let ownerAddress;
  let leaderAddress;
  let score;
  let endTime;
  let beginContract;
  let contractSubmission;
  before(async function() {
    // requires entire contract to be started, and a submission to set the leader
    contract = await compileCode();
    accounts = await web3.eth.getAccounts();
    ownerAddress = accounts[0];
    leaderAddress = accounts[1];
    endTime = parseInt(await contract.methods.currentTime().call()) + 3; // changing this to longer than the timeout time will fail
    web3.eth.getBalance(ownerAddress).then(console.log);  // balance of owner before beginContract
    beginContract = await contract.methods.beginContract(endTime).send({from: ownerAddress, value: setContractAmount});
    score = 60; // to ensure leader address is updated
    contractSubmission = await contract.methods.contractSubmission(score).send({from: leaderAddress});
    web3.eth.getBalance(leaderAddress).then(console.log);
  });
  beforeEach(function(done) {     
    setTimeout(function() {
      done();
    }, 5000);
  });
  it("ownerWithdrawal() can only be called if there is no submission", async function(){
    expect.fail("Owner cannot withdraw after there has been a submission")
    const withdraw = await contract.methods.ownerWithdrawal().send({from: leaderAddress});
  });
});

// unit tests
// use try catch to go over failures, so that the tests dont stop
// in the catch block make sure values havent changed and then assert that the values havent changed

