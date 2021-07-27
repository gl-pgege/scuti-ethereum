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

// TODO: Move json to separate JSON file
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
    {
        functionName: "contractSubmission",
        arguments: [50],
        expectedOutput: 50,
        valueToCheck: "leaderScore",
        account: "developer",
        negativeTest: false,
        payableAmount: 0,
        resetContract: false
    },
    {
        functionName: "contractSubmission",
        arguments: [50],
        expectedOutput: 50,
        valueToCheck: "leaderScore",
        account: "contract_owner",
        negativeTest: true,
        payableAmount: 0,
        resetContract: false
    },
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

// TODO: Decide if we want to make this part of the test cases (contract owner provides this)
const mathematicsConstructorDetails = {
    payableAmount: 0,
    arguments: [],
    accountsNeeded: ['user1'],
    deploymentAccount: 'user1'
}

const contestConstructorDetails = {
    payableAmount: 0,
    arguments: ['[contract_owner]', 1000],
    accountsNeeded: ['contract_owner', 'developer', 'not_developwe'],
    deploymentAccount: 'contract_owner'    
}

module.exports = {
    mathematicTestJsonObj,
    contestTestJsonObject,
    mathematicsConstructorDetails,
    contestConstructorDetails
}