const path = require("path");
const fs = require("fs");
const solc = require("solc");
const Web3 = require("web3");
const ganache = require("ganache-cli");
const _ = require("lodash");
var expect = require('chai').expect

const web3 = new Web3(ganache.provider());
const GAS = 6700000;
const GASPRICE = '97000000000';

const testJsonObj = [
    {
        functionName: "add",
        arguments: [1, 2, 3],
        expectedOutput: 6,
        valueToCheck: "answer",
        accountIndex: 1,
        negativeTest: false,
        errorMsg: ""
    },
    {
        functionName: "subtract",
        arguments: [10, 2],
        expectedOutput: 8,
        valueToCheck: "answer",
        accountIndex: 0,
        negativeTest: false,
        errorMsg: ""
    },
    {
        functionName: "multiply",
        arguments: [1, 2, 3, 4],
        expectedOutput: 24,
        valueToCheck: "answer",
        accountIndex: 0,
        negativeTest: false,
        errorMsg: ""  
    },
    {
        functionName: "divide",
        arguments: [4, 0],
        expectedOutput: 2,
        valueToCheck: "answer",
        accountIndex: 0,
        negativeTest: true,
        errorMsg: "VM Exception while processing transaction: revert"
    },
    {
        functionName: "divide",
        arguments: [4, 2],
        expectedOutput: 2,
        valueToCheck: "answer",
        accountIndex: 0,
        negativeTest: false,
        errorMsg: ""
    },
]

function compileCode(contractName){

    const contractFileName = `${contractName}.sol`;

    // needs to adjust to contract name
    const inboxPath = path.resolve(__dirname, "contracts", contractFileName);
        
    const source = fs.readFileSync(inboxPath, "utf-8");

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

    return compiledContract.contracts[contractFileName][contractName];

}

async function calculateGasPriceForTxn(account, transaction, gasDetails = {}){
    const initialAccountBalance = await web3.eth.getBalance(account);
    const txnReturnValue = await transaction.send({
        from: account,
        ...gasDetails
    });
    const finalAccountBalance = await web3.eth.getBalance(account);
    const gasUsed = initialAccountBalance - finalAccountBalance;

    console.log("gasUsed", gasUsed);

    return {
        gasUsed,
        txnReturnValue
    };
}

const expectThrowsAsync = async (method, errorMessage) => {
    let error = null
    try {
        await method()
    }
    catch (err) {
        error = err
    }

    if (errorMessage) {
        try{
            console.log("Pass - ", expect(error.message).to.equal(errorMessage))
        } catch(error){
            console.log("Fail - ", error);
        }
    }
}

async function deployAndTestContract(contractName){
    // needs to adjust to contract name
    const {abi, evm} = compileCode(contractName);

    const userAccounts = await web3.eth.getAccounts();

    let gasSpent = 0;

    try{
        
        let transaction = await new web3.eth.Contract(abi).deploy({
            data: `0x${evm.bytecode.object}`,
        })

        let contractCreationGasDetails = {
            gas: GAS,
            gasPrice: GASPRICE
        }
        // deploy smart contract
        let {gasUsed, txnReturnValue: contract} = await calculateGasPriceForTxn(userAccounts[0], transaction, contractCreationGasDetails);
        gasSpent += gasUsed;        

        for(let i = 0; i < testJsonObj.length; i++){
            const {
                functionName, 
                arguments, 
                expectedOutput, 
                valueToCheck, 
                accountIndex,
                negativeTest,
                errorMsg
            } = testJsonObj[i];

            transaction = contract.methods[functionName](...arguments);

            if(negativeTest){
                await expectThrowsAsync((async function(){
                    return await transaction.send({
                        from: userAccounts[accountIndex]
                    });
                }), errorMsg);
            } else {
                let { gasUsed } = await calculateGasPriceForTxn(userAccounts[accountIndex], transaction)
                gasSpent += gasUsed;
                
                let actualOutput = await contract.methods[valueToCheck]().call()
    
                try{
                    console.log("Pass - ", expect(expectedOutput).to.equal(parseInt(actualOutput)))
                } catch(error){
                    console.log("Fail - ", error);
                }
            }
        }

        // const finalUserAccountBalance = await web3.eth.getBalance(userAccounts[0]);

        console.log("gas spent", gasSpent);
    } catch(error){
        console.log(error);
    }
}

deployAndTestContract("Mathematics");