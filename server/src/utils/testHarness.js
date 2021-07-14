const path = require("path");
const fs = require("fs");
const solc = require("solc");
const Web3 = require("web3");
const ganache = require("ganache-cli");
const _ = require("lodash");
var expect = require('chai').expect;

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
    const userAccounts = await web3.eth.getAccounts();
    let accountsObj = {}

    rolesArray.forEach((role, index) => {
        accountsObj[role] = userAccounts[index]
    })

    return accountsObj
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
    
    console.log(sendDetails);
    
    const initialAccountBalance = await web3.eth.getBalance(account);
    const txnReturnValue = await transaction.send({
        ...sendDetails
    });
    const finalAccountBalance = await web3.eth.getBalance(account);
    const gasUsed = initialAccountBalance - finalAccountBalance;

    console.log("gasUsed", gasUsed);

    return {
        gasUsed,
        txnReturnValue
    };
}

const expectThrowsAsync = async (method) => {

    let testResult;

    let error = null
    try {
        await method()
    } catch (err) {
        error = err
    }

    
    try{
        testResult = `Pass - ${(expect(error.message).to.not.be.empty)}`;
        
    } catch(error){
        testResult = `Fail - ${error}`;
    }

    return testResult;
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
            } else {
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

    const parsedConstructorArguments = replaceAddressPlaceholdersWithAccounts(constructorArguments, accounts)
    console.log(parsedConstructorArguments);

    let transaction = await new web3.eth.Contract(abi).deploy({
        data: `0x${evm.bytecode.object}`,
        // IF CONSTRUCTOR ACCEPTS ARGUMENTS WE PASS THEM WITH OUR SETTINGS
        arguments: parsedConstructorArguments,
    })

    // deploy smart contract
    let {gasUsed, txnReturnValue: contract} = await sendAndCalculateGasUsedForTxn(accounts[deploymentAccount], transaction, transactionTypes.deploy, true, constructorPayableAmount);

    return {
        gasUsed,
        contract
    }
}

async function testContract(contractPath, constructorSettings, testCases){

    const {accountsNeeded, deploymentAccount} = constructorSettings;
    const userAccounts = await generateAccountsBasedOnRoles(accountsNeeded);
    let testResults = {}

    try{
        
        let {gasUsed, contract: initialContract} = await deployContract(contractPath, constructorSettings, userAccounts)
        // gasSpent += gasUsed;        

        let testResult;

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
                const {gasUsed: newContractGasUse, contract: newContract} = await deployContract(contractPath, constructorSettings, userAccounts);
                gasUsed = newContractGasUse,
                contract = newContract;
            }

            transaction = contract.methods[functionName](...parsedArguments);

            if(negativeTest){
                testResult = await expectThrowsAsync(
                    (async function(){
                        return await transaction.send({
                            from: userAccounts[account]
                        });
                    })
                );
                const failingProperty = `${functionName}-${i}-failing-test`;
                testResults[failingProperty] = testResult;
            } else {
                
                let { gasUsed } = await sendAndCalculateGasUsedForTxn(userAccounts[account], transaction, transactionTypes.functionCall, false ,payableAmount);
                // gasSpent += gasUsed;
            }

            let actualOutput = await contract.methods[valueToCheck]().call()

            if(typeof expectedOutput === "number"){
                actualOutput = parseInt(actualOutput);
            }

            try{
                testResult = `Pass - ${(expect(expectedOutput).to.equal(actualOutput))}`;
            } catch(error){
                testResult = `Fail - ${error}`;
            }

            const property = `${functionName}-${i}`;
            testResults[property] = testResult;
        }

        return testResults
    } catch(error){
        console.log(error);
        throw new Error(error);
    }
}

module.exports = {
    testContract
}