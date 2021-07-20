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
    console.log(abi);
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

async function expectThrowsAsync(method) {

    let error = null
    try {
        await method()
    } catch (err) {
        error = err
    }

    expect(error).to.not.be.null        
}

function expectWrapper(expectedOutput, actualOutput){
    try {
        if(typeof expectedOutput === "object"){
            expect(expectedOutput).to.deep.equal(actualOutput)
        } else {
            expect(expectedOutput).to.equal(actualOutput)
        }
    } catch(error) {
        throw new Error(error)
    }
    
}

function isSolidityMap(value){
    return Boolean(value.includes("[")) && Boolean(value.includes("]"))
}

function extractPropertyFromValueToCheck(value){
    let property;
    let mapName;

    const matches = value.match(/\[(.*?)\]/);

    if (matches) {
        property = matches[1];
    }

    mapName = value.replace(property, "")
                        .replace("[", "")
                        .replace("]", "");

    return {
        property,
        mapName
    }
}

async function testSolidityFunction(contract, testCase){
    
    return new Promise(async (resolve, reject) => {
        const {
            functionName, 
            expectedOutput, 
            valueToCheck, 
            negativeTest,
        } = testCase;
        
        let actualOutput;
    
        let arrayTestState;
    
        if(Array.isArray(expectedOutput)){
            arrayTestState = {
                passed: 0,
                failed: 0,
                failures: []
            }
    
            for(let i = 0; i < expectedOutput.length; i++){
                actualOutput = await contract.methods[valueToCheck](i).call()
    
                try{
                    expectWrapper(expectedOutput[i], actualOutput); 
                    arrayTestState.passed += 1;         
                } catch(error){
                    arrayTestState.failed += 1;
                    arrayTestState.failures.push(
                        {
                            index: i,
                            issue: error.message
                        }
                    )
                }
            }
            
            console.log(arrayTestState.failures);
            if(arrayTestState.failed > 0){
                reject({
                    functionName,
                    valueToCheck,
                    negativeTest,
                    issue: arrayTestState.failures
                })
            } else {
                resolve({
                    functionName,
                    valueToCheck,
                    negativeTest,
                })
            }
            
        } else {

            if(isSolidityMap(valueToCheck)){
                const {property, mapName} = extractPropertyFromValueToCheck(valueToCheck)
                actualOutput = await contract.methods[mapName](property).call();
            } else {
                actualOutput = await contract.methods[valueToCheck]().call();
            }
    
            // TODO: Make the following code snippets into a function to follow DRY principles
            if(typeof expectedOutput === "number"){
                actualOutput = parseInt(actualOutput);
            }
    
            try{
                
                if(typeof expectedOutput === "object"){
                    expect(expectedOutput).to.deep.equal(actualOutput)
                } else {
                    expect(expectedOutput).to.equal(actualOutput)
                }
                
                
                resolve({
                    functionName,
                    valueToCheck,
                    negativeTest,
                })
            } catch(error){
    
                reject({
                    functionName,
                    valueToCheck,
                    negativeTest,
                    issue: error.message
                })
            }
        }
    })
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
                                    true, 
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
                    
                    let { gasUsed: transactionCost } = await sendAndCalculateGasUsedForTxn(userAccounts[account], transaction, transactionTypes.functionCall, true ,payableAmount);
                    // GAS CALCULATION
                    gasSpent += transactionCost;        
                }
    
                try{
                    passedTests.push(await testSolidityFunction(contract, testCases[i]))
                } catch (error) {
                    failedTests.push(error)
                }        
            }
    
            const testResults = generateTestResults(passedTests, failedTests, gasSpent);
            
            resolve(testResults)
        } catch(error){
            reject(error);
        }
    })
}

const mathematicTestJsonObj = [
    {
        functionName: "addBook",
        arguments: [{
            title: "test",
            author: "paul",
            book_id: 12
        }],
        expectedOutput: {
            "0": "test",
            "1": "paul",
            "2": "12",
            title: "test",
            author: "paul",
            book_id: "12"
        },
        valueToCheck: "book",
        account: "user1",
        negativeTest: false,
        payableAmount: 0,
        resetContract: false
    },
    {
        functionName: "subtract",
        arguments: [10, 2],
        expectedOutput: 8,
        valueToCheck: "answers[subtract]",
        account: "user1",
        negativeTest: false,
        payableAmount: 0,
        resetContract: false
    },
    // {
    //     functionName: "multiply",
    //     arguments: [1, 2, 3, 4],
    //     expectedOutput: 24,
    //     valueToCheck: "answer",
    //     account: "user1",
    //     negativeTest: false,
    //     payableAmount: 0,
    //     resetContract: false 
    // },
    // {
    //     functionName: "divide",
    //     arguments: [4, 0],
    //     expectedOutput: 0,
    //     valueToCheck: "answer",
    //     account: "user1",
    //     negativeTest: true,
    //     payableAmount: 0,
    //     resetContract: true
    // },
    // {
    //     functionName: "divide",
    //     arguments: [4, 2],
    //     expectedOutput: 2,
    //     valueToCheck: "answer",
    //     account: "user1",
    //     negativeTest: false,
    //     payableAmount: 0,
    //     resetContract: false
    // },
]

// TODO: Find a standard/way to specify that an address should be used as an argument
const contestTestJsonObject = [
    {
        functionName: "beginContract",
        arguments: [1626098243],
        expectedOutput: true,
        valueToCheck: "contractFunded",
        account: "contract_owner",
        negativeTest: false,
        payableAmount: 1000,
        resetContract: false
    },
    {
        functionName: "beginContract",
        arguments: [1626098243],
        expectedOutput: false,
        valueToCheck: "contractFunded",
        account: "contract_owner",
        negativeTest: true,
        payableAmount: 999,
        resetContract: true
    },
    {
        functionName: "beginContract",
        arguments: [1626098243],
        expectedOutput: false,
        valueToCheck: "contractFunded",
        account: "developer",
        negativeTest: true,
        payableAmount: 1000,
        resetContract: true
    },
    // {
    //     functionName: "contractSubmission",
    //     arguments: [50],
    //     expectedOutput: 50,
    //     valueToCheck: "leaderScore",
    //     account: "developer",
    //     negativeTest: false,
    //     payableAmount: 0,
    //     resetContract: false
    // },
    // {
    //     functionName: "contractSubmission",
    //     arguments: [50],
    //     expectedOutput: 50,
    //     valueToCheck: "leaderScore",
    //     account: "contract_owner",
    //     negativeTest: true,
    //     payableAmount: 0,
    //     resetContract: false
    // },
    // {
    //     functionName: "endContract",
    //     arguments: [],
    //     expectedOutput: false,
    //     valueToCheck: "contractStarted",
    //     account: "contract_owner",
    //     negativeTest: false,
    //     payableAmount: 0,
    //     resetContract: false
    // },
    // {
    //     functionName: "winnerWithdrawal",
    //     arguments: [],
    //     expectedOutput: 0,
    //     valueToCheck: "contractAmount",
    //     account: "developer",
    //     negativeTest: false,
    //     payableAmount: 0,
    //     resetContract: false
    // },
]

// TODO: Decide if we want to make this part of the test cases
const mathematicsConstructorDetails = {
    payableAmount: 0,
    arguments: [],
    accountsNeeded: ['user1'],
    deploymentAccount: 'user1'
}

const contestConstructorDetails = {
    payableAmount: 0,
    // TODO: Find a standard/way to specify that an address should be used as an argument
    arguments: ['[contract_owner]', 1000],
    accountsNeeded: ['contract_owner', 'developer'],
    deploymentAccount: 'contract_owner'    
}

// testContract("./contracts/Contest.sol", contestConstructorDetails, contestTestJsonObject);

async function main(){
    const testResults = await testContract("./contracts/Mathematics.sol", mathematicsConstructorDetails, mathematicTestJsonObj);

    console.log(testResults);
}

main();