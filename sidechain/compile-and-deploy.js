const path = require('path');
const solc = require('solc');
const fs = require('fs');
const Web3 = require('web3');
const ganache = require("ganache-cli");
const HDWalletProvider = require("@truffle/hdwallet-provider");


const SidechainProvider = new HDWalletProvider({
    mnemonic: "kidney describe moon museum join brave birth detect harsh little hockey turn",
    providerOrUrl: "http://127.0.0.1:1234"
});

const web3 = new Web3(ganache.provider()); 
const web3Sidechain = new Web3(SidechainProvider); 
function extractFileNameFromPath(path){
    return path.replace(/^.*[\\\/]/, '');
}

// instance of Web3
function compileContract(contractPath){

  const contractFileName = extractFileNameFromPath(contractPath);
  const contractName = contractFileName.replace(".sol", "");
      
  const source = fs.readFileSync(contractPath, "utf-8");

  let sources = {}

  sources[contractFileName] = {
      content: source
  }

  // needs to adjust to contract name
  const input = {
      language: "Solidity",
      sources: {...sources},
      settings: {
          outputSelection: {
              '*': {
                  '*': ['*']
              }
          }
      }
  };

  const compiledContract = JSON.parse(solc.compile(JSON.stringify(input)));
  console.log(compiledContract);
  return compiledContract.contracts[contractFileName][contractName];

}

async function deployContract(contractPath, constructorSettings, contractOwner, web3Wrapper){
  // Contract compilation needs to adjust to contract name
  const {abi, evm} = compileContract(contractPath);
  console.log(abi);
  const {
      arguments: constructorArguments, 
      payableAmount: constructorPayableAmount
      } = constructorSettings;

  return new Promise( async (resolve, reject) => {
      try {
        const gasEstimate = await web3.eth.estimateGas({
            from: contractOwner
        })
          let contract = await new web3Wrapper.eth.Contract(abi).deploy({
              data: `0x${evm.bytecode.object}`,
              arguments: constructorArguments,
          }).send({ 
                from: contractOwner,
                gas: 6700000,
                gasPrice: gasEstimate
            })
  
          resolve(contract)

      } catch (error) {
          reject(error);
      }
  });
}

(async function (){
  let accounts;
  let sidechainAccounts;
  accounts = await web3.eth.getAccounts();
  sidechainAccounts = await web3Sidechain.eth.getAccounts();
  

  const goodlabs = {
      main: accounts[0],
      side: sidechainAccounts[0]    
    }

  const contractOwner = {
    main: accounts[1],
    side: sidechainAccounts[1]
  }
  const developer = {
    main: accounts[2],
    side: sidechainAccounts[2]
  }
  
  //const DeployedSideContest = await deployContract("../contracts/SideContest.sol", { arguments: [goodlabs.side]}, goodlabs.side, web3Sidechain);
  const DeployedTestContest = await deployContract("../contracts/TestContest.sol", { arguments: [goodlabs.main, contractOwner.main, 1000]}, contractOwner.main, web3);

  console.log(DeployedTestContest);
})()



