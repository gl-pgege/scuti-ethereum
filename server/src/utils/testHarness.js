const path = require("path");
const fs = require("fs");
const solc = require("solc");
const Web3 = require("web3");
const ganache = require("ganache-cli");
const _ = require("lodash");
const expect = require('chai').expect;
const { reject } = require("lodash");

const web3 = new Web3(ganache.provider());
const GAS = 6700000;
const GASPRICE = '97000000000';

const transactionTypes = {
    deploy: "DEPLOY",
    functionCall: "FUNCTION_CALL",
}

function extractFileNameFromPath(path){
    return path.replace(/^.*[\\\/]/, '');
}

// TODO: Add ability to change compiler versions based on the contract specified compiler versions
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

    return compiledContract.contracts[contractFileName][contractName];

}

function generateTxnSendArgumentObj(account, explicitGas, payableAmount=0){

    const defaultGasValues = {
        gas: GAS,
        gasPrice: GASPRICE
    };    

    let txnArgumentObj = {
        from: account,
    };

    if(explicitGas){
        txnArgumentObj = {
            ...txnArgumentObj,
            ...defaultGasValues
        };
    }

    if(payableAmount > 0){
        txnArgumentObj = {
            ...txnArgumentObj,
            value: payableAmount
        };
    }

    return txnArgumentObj;
}

async function generateAccountsBasedOnRoles(rolesArray){
    return new Promise(async (resolve, reject) => {
        try {
            const userAccounts = await web3.eth.getAccounts();
            let accountsObj = {}
        
            rolesArray.forEach((role, index) => {
                accountsObj[role] = userAccounts[index]
            })
        
            resolve(accountsObj);
        } catch (error){
            reject(error)
        }
    })
}

async function sendAndCalculateGasUsedForTxn(account, transaction, txnType, explicitGas=false, payableAmount=0){
    
    let sendDetails;

    switch(txnType){
        case transactionTypes.deploy:
            sendDetails = generateTxnSendArgumentObj(account, true, payableAmount);
            break;
        case transactionTypes.functionCall:
            sendDetails = generateTxnSendArgumentObj(account, explicitGas, payableAmount);
            break;
        default:
            sendDetails = generateTxnSendArgumentObj(account, false);
            break;
    }
    
    return new Promise(async (resolve, reject) => {
        
        try {
            const initialAccountBalance = await web3.eth.getBalance(account);
            const txnReturnValue = await transaction.send({
                ...sendDetails
            });
            const finalAccountBalance = await web3.eth.getBalance(account);
            const gasUsed = initialAccountBalance - finalAccountBalance;

            resolve({
                gasUsed,
                txnReturnValue
            });
        } catch (error) {
            reject(error);
        }

    });    
}

async function expectThrowsAsync(method) {

    let error = null
    try {
        await method()
    } catch (err) {
        error = err
    }

    expect(error).to.not.be.null        
}

function isAddress(property){
    const OPENING_BRACKET = '[';
    const CLOSING_BRACKET = ']';

    if(typeof property === 'string' && 
            property.indexOf(OPENING_BRACKET) > -1 && 
            property.indexOf(CLOSING_BRACKET) > -1){
        return true;
    }

    return false;
}

function replaceAddressPlaceholdersWithAccounts(funcArguments, availableAccounts){
    let parsedFuncArgs = [];

    funcArguments.forEach(argument => {
        if(isAddress(argument)){
            const parsedArgument = argument.replace('[', '').replace(']', '');
            if(parsedArgument in availableAccounts){
                parsedFuncArgs.push(availableAccounts[parsedArgument]);
            } else {contestTestJsonObject
                // TODO: Create an error object with all error messages you'll need & keep it updated
                throw new Error("Account does not exist within availableAccounts, please ensure specify an account that exists")
            }
        } else {
            parsedFuncArgs.push(argument)
        }
    })    

    return parsedFuncArgs
}


async function deployContract(contractPath, constructorSettings, accounts){
    // Contract compilation needs to adjust to contract name
    const {abi, evm} = compileContract(contractPath);
    const {
        arguments: constructorArguments, 
        payableAmount: constructorPayableAmount,
        deploymentAccount
    } = constructorSettings;

    const parsedConstructorArguments = replaceAddressPlaceholdersWithAccounts(constructorArguments, accounts);

    return new Promise( async (resolve, reject) => {
        try {
            let transaction = await new web3.eth.Contract(abi).deploy({
                data: `0x${evm.bytecode.object}`,
                arguments: parsedConstructorArguments,
            })
        
            // deploy smart contract
            let {gasUsed, txnReturnValue: contract} = await sendAndCalculateGasUsedForTxn(accounts[deploymentAccount], transaction, transactionTypes.deploy, true, constructorPayableAmount);
    
            resolve({
                gasUsed,
                contract
            })

        } catch (error) {
            reject(error);
        }
    });
}

function generateTestResults(passedTests, failedTests, gasSpent){
    return {
        pass: passedTests.length,
        fail: failedTests.length,
        failedTests,
        gasUsed: gasSpent
    }
}

async function testContract(contractPath, constructorSettings, testCases){

    let passedTests = [];
    let failedTests = [];
    let gasSpent = 0;

    const {accountsNeeded} = constructorSettings;
    
    const userAccounts = await generateAccountsBasedOnRoles(accountsNeeded);

    return new Promise(async (resolve, reject) => {
        try{
        
            let {gasUsed: deploymentCost, contract: initialContract} = await deployContract(contractPath, constructorSettings, userAccounts)
            // GAS CALCULATION
            gasSpent += deploymentCost;        
    
            for(let i = 0; i < testCases.length; i++){
                let contract = initialContract;
    
                const {
                    functionName, 
                    arguments, 
                    expectedOutput, 
                    valueToCheck, 
                    account,
                    negativeTest,
                    payableAmount,
                    resetContract
                } = testCases[i];
    
                const parsedArguments = replaceAddressPlaceholdersWithAccounts(arguments, userAccounts);
    
                if(resetContract){
                    const {gasUsed: newContractDeploymentCost , contract: newContract} = await deployContract(contractPath, constructorSettings, userAccounts);
                    // GAS CALCULATION
                    gasSpent += newContractDeploymentCost;        
    
                    contract = newContract;
                }
    
                transaction = contract.methods[functionName](...parsedArguments);
    
                if(negativeTest){
                    
                    try{
                        await expectThrowsAsync(
                            async function(){
                                let {gasUsed: failingTransactionCost} = await sendAndCalculateGasUsedForTxn(
                                    userAccounts[account], 
                                    transaction, 
                                    transactionTypes.functionCall, 
                                    false, 
                                    payableAmount
                                )
                                // GAS CALCULATION
                                gasSpent += failingTransactionCost;        
                            }
                        );
    
                        passedTests.push({
                            functionName,
                            valueToCheck,
                            negativeTest,
                        })
    
                    } catch (error) {
                        failedTests.push({
                            functionName,
                            valueToCheck,
                            negativeTest,
                            issue: "expected transaction to revert"
                        })
                    }
                } else {
                    
                    let { gasUsed: transactionCost } = await sendAndCalculateGasUsedForTxn(userAccounts[account], transaction, transactionTypes.functionCall, false ,payableAmount);
                    // GAS CALCULATION
                    gasSpent += transactionCost;        
                }
    
                let actualOutput = await contract.methods[valueToCheck]().call()
    
                if(typeof expectedOutput === "number"){
                    actualOutput = parseInt(actualOutput);
                }
    
                try{
                    expect(expectedOutput).to.equal(actualOutput)
                    
                    passedTests.push({
                        functionName,
                        valueToCheck,
                        negativeTest,
                    })
                } catch(error){
    
                    failedTests.push({
                        functionName,
                        valueToCheck,
                        negativeTest,
                        issue: error.message
                    })
                }            
            }
    
            const testResults = generateTestResults(passedTests, failedTests, gasSpent);
            
            resolve(testResults)
        } catch(error){
            reject(error);
        }
    })
}

module.exports = {
    testContract
}