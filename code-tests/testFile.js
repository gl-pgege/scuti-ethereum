const path = require("path");
const fs = require("fs");
const solc = require("solc");
const Web3 = require("web3");
const ganache = require("ganache-cli");
const _ = require("lodash");
var expect = require('chai').expect;
const { send } = require("process");

const web3 = new Web3(ganache.provider());
const GAS = 6700000;
const GASPRICE = '97000000000';
const VALUE = 1000;

const transactionTypes = {
    deploy: "DEPLOY",
    functionCall: "FUNCTION_CALL",
}

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
    let error = null
    try {
        await method()
    }
    catch (err) {
        error = err
    }

    
    try{
        console.log("Pass - ", expect(error.message).to.not.be.empty)
    } catch(error){
        console.log("Fail - ", error);
    }
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


async function deployContract(contractName, constructorSettings, accounts){
    // Contract compilation needs to adjust to contract name
    const {abi, evm} = compileCode(contractName);
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

async function testContract(contractName, constructorSettings, testCases){

    const {accountsNeeded, deploymentAccount} = constructorSettings;
    const userAccounts = await generateAccountsBasedOnRoles(accountsNeeded);

    try{
        
        let {gasUsed, contract: initialContract} = await deployContract(contractName, constructorSettings, userAccounts)
        // gasSpent += gasUsed;        

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
                const {gasUsed: newContractGasUse, contract: newContract} = await deployContract(contractName, constructorSettings, userAccounts);
                gasUsed = newContractGasUse,
                contract = newContract;
            }

            transaction = contract.methods[functionName](...parsedArguments);

            if(negativeTest){
                await expectThrowsAsync(
                    (async function(){
                        return await transaction.send({
                            from: userAccounts[account]
                        });
                    })
                );
            } else {
                
                let { gasUsed } = await sendAndCalculateGasUsedForTxn(userAccounts[account], transaction, transactionTypes.functionCall, false ,payableAmount);
                // gasSpent += gasUsed;
            }

            let actualOutput = await contract.methods[valueToCheck]().call()

            if(typeof expectedOutput === "number"){
                actualOutput = parseInt(actualOutput);
            }

            try{
                console.log("Pass - ", expect(expectedOutput).to.equal(actualOutput));
            } catch(error){
                console.log("Fail - ", error);
            }
        }

        // console.log("gas spent", gasSpent);
    } catch(error){
        console.log(error);
    }
}


const mathematicTestJsonObj = [
    {
        functionName: "add",
        arguments: [1, 2, 3],
        expectedOutput: 6,
        valueToCheck: "answer",
        account: "user1",
        negativeTest: false,
        payableAmount: 0,
        resetContract: false
    },
    {
        functionName: "subtract",
        arguments: [10, 2],
        expectedOutput: 8,
        valueToCheck: "answer",
        account: "user1",
        negativeTest: false,
        payableAmount: 0,
        resetContract: false
    },
    {
        functionName: "multiply",
        arguments: [1, 2, 3, 4],
        expectedOutput: 24,
        valueToCheck: "answer",
        account: "user1",
        negativeTest: false,
        payableAmount: 0,
        resetContract: false 
    },
    {
        functionName: "divide",
        arguments: [4, 0],
        expectedOutput: 0,
        valueToCheck: "answer",
        account: "user1",
        negativeTest: true,
        payableAmount: 0,
        resetContract: true
    },
    {
        functionName: "divide",
        arguments: [4, 2],
        expectedOutput: 2,
        valueToCheck: "answer",
        account: "user1",
        negativeTest: false,
        payableAmount: 0,
        resetContract: false
    },
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

testContract("Contest", contestConstructorDetails, contestTestJsonObject);
// testContract("Mathematics", mathematicsConstructorDetails, mathematicTestJsonObj);