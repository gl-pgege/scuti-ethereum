const path = require("path");
const fs = require("fs");
const solc = require("solc");
const Web3 = require("web3");
const ganache = require("ganache-cli");
const _ = require("lodash");
var expect = require('chai').expect

const testJsonObj = [
    {
        functionName: "add",
        arguments: [1, 2, 3],
        expectedOutput: 6,
        valueToCheck: "answer"
    },
    {
        functionName: "subtract",
        arguments: [10, 2],
        expectedOutput: 8,
        valueToCheck: "answer"
    },
    {
        functionName: "multiply",
        arguments: [1, 2, 3, 4],
        expectedOutput: 24,
        valueToCheck: "answer"
    },
    {
        functionName: "divide",
        arguments: [4, 2],
        expectedOutput: 2,
        valueToCheck: "answer"
    }
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

async function deployAndTestContract(contractName){
    // needs to adjust to contract name
    const {abi, evm} = compileCode(contractName);

    const web3 = new Web3(ganache.provider());

    const user_accounts = await web3.eth.getAccounts();

    console.log("Account Balance", await web3.eth.getBalance(user_accounts[0]));

    try{
        
        // deploy smart contract
        const contract = await new web3.eth.Contract(abi).deploy({
            data: `0x${evm.bytecode.object}`,
        }).send({
            from: user_accounts[0],
            gas: 4700000,
            gasPrice: '30000000000',
        });


        console.log("Account Balance", await web3.eth.getBalance(user_accounts[0]));

        for(let i = 0; i < testJsonObj.length; i++){
            let methodName = testJsonObj[i].functionName;
            let funcArguments = testJsonObj[i].arguments;
            let expectedOutput = testJsonObj[i].expectedOutput;
            let valueToCheck = testJsonObj[i].valueToCheck;

            await contract.methods[methodName](...funcArguments).send({ from: user_accounts[0] });
            let actualOutput = await contract.methods[valueToCheck]().call()

            // LOOK INTO HOW TO ASSERT HERE
            // if(assert.equal(expectedOutput, actualOutput)){
            //     console.log("pass");
            // } else {
            //     console.log("fail");
            // }

            try{
                expect(expectedOutput).to.equal(parseInt(actualOutput));
                console.log("pass")
            } catch(error){
                console.log("fail", error);
            }
        

            console.log("Account Balance", await web3.eth.getBalance(user_accounts[0]));
        }
    } catch(error){
        console.log(error);
    }
}

deployAndTestContract("Mathematics");