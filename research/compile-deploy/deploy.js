const Web3 = require("web3");
const {abi, evm} = require("./compile");
const ganache = require("ganache-cli");
const HDWalletProvider = require("@truffle/hdwallet-provider");

const mnemonicPhrase = 'opinion brand beach victory step mango grocery action vault reveal swamp club';

// To use local ganache-cli instance
// Ganache-cli gives us a provider with unlocked accounts where there isn't much we need to do to get started
const web3 = new Web3(ganache.provider());

// Lec 58-63
// HDWalletProvider allows us to deploy a contract with an account derived from our mnemonic
// The providerUrl is the ethereum network/node we''re deploying to

(async () => {

    const provider = new HDWalletProvider({
        mnemonic: mnemonicPhrase,
        providerOrUrl: "https://goerli.infura.io/v3/43083b848d064bcea5560ad8ad3e5623"
    });
    
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();

    console.log(accounts[0])

    try{
        
        // const txn = await web3.eth.sendTransaction({to:accounts[1], from:accounts[0], value:10000})
        // console.log(txn);
        const contract = await new web3.eth.Contract(abi).deploy({
            data: `0x${evm.bytecode.object}`,
        }).send({
            from: accounts[0],
            // gas: 4700000,
            // gasPrice: '30000000000',
            value: 1000
        });

        const response = await contract.methods['getLeaderScore']().call();
        console.log(response);
    } catch(error){
        console.log(error);
    }

    
})();


