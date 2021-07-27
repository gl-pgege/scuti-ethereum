const path = require("path");
const fs = require("fs");
const solc = require("solc");

const inboxPath = path.resolve(__dirname, "contracts", "Contest.sol");
const source = fs.readFileSync(inboxPath, "utf-8");

const input = {
    language: "Solidity",
    sources: {
        "Contest.sol": {
            content: source
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

const compiledContracts = JSON.parse(solc.compile(JSON.stringify(input)));

module.exports = compiledContracts.contracts["Contest.sol"]["Contest"];