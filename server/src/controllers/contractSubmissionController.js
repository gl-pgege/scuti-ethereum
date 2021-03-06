const path = require('path');
const web3 = require("../../utils/getWeb3");
const { extractCompressedFile } = require("../../utils/fileUtils");
const {
    testContract,
    testResultsToScore
} = require("../utils/testHarness");
const {
    contestConstructorDetails,
    contestTestJsonObject
} = require("../../constants/jsonTestValues");
const { 
    generateGithubDownloadUrl, 
    downloadRepo
} = require("../../utils/github.js");
const { submitDeveloperTestScore } = require('../../utils/blockchain');

async function contractSubmissionController(req, res){

    const { 
        repoName, 
        commitId,
        pathToTestFile,
        contractAddress,
        network,
    } = req.body;

    let testResults;
    
    try {
        const url = generateGithubDownloadUrl(repoName, commitId);

        const downloadedTarFolderPath = await downloadRepo(url);

        const repoTestingDirectory = path.dirname(downloadedTarFolderPath);

        const testFileLocation = await extractCompressedFile(downloadedTarFolderPath, repoTestingDirectory, pathToTestFile);

        if(testFileLocation){
            /* 
                TODO: contestTestJsonObject - currently is a json object imported from a javascript file, needs to be moved
                to a JSON file. This allows us to retrieve contract owner's test cases
            */
            testResults = await testContract(testFileLocation, contestConstructorDetails, contestTestJsonObject);
        }

        const score = `${testResultsToScore(testResults)}`;

        await submitDeveloperTestScore(network, contractAddress, score);

        res.status(200).json({
            "results": (testResults),
            "testScore": score
        })

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }      
}


module.exports = {
    contractSubmissionController
};