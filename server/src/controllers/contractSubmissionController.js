const fetch = require("node-fetch");
const fs = require('fs');
const path = require('path');
const extractCompressedFile = require("../utils/extractCompressedFile");
const {testContract} = require("../utils/testHarness");
const {
    contestConstructorDetails,
    contestTestJsonObject
} = require("../constants/jsonTestValues");
const { generateGithubDownloadUrl } = require("../utils/url.js");


async function downloadRepo(url){

    let compressedRepoPath;

    // TODO: Add to environment variable file
    const authHeader = `token ${process.env.PERSONAL_ACCESS_TOKEN}`;
    const options = {
        method: "GET",
        headers: {
            Authorization: authHeader
        }
    };

    try{
        const response = await fetch(url, options)
        const data = await response.buffer();

        // TODO: (David) Create the "contracts" folder if it doesn't exist 
        // (create function that accepts the tar.gz folder name if contracts exists just send back path, otherwise create and send back path)
        compressedRepoPath = path.resolve(__dirname, '..', 'contracts', 'contract.tar.gz');
        
        fs.createWriteStream(compressedRepoPath).write(data);

    } catch (error){
        console.log(error);
    }

    return compressedRepoPath;
    
}

async function contractSubmissionController(req, res){

    const { 
        repoName, 
        commitId,
        pathToTestFile
    } = req.body;

    // It's our repository so 
    const url = generateGithubDownloadUrl(repoName, commitId);
    
    const downloadedTarFolderPath = await downloadRepo(url);
    const repoTestingDirectory = path.dirname(downloadedTarFolderPath);
    
    let testResults;

    if(downloadedTarFolderPath){
        try {
            // const extractedContact = path.resolve(__dirname, '..', '..', '..', 'code-tests', 'contracts', contractNameWithExtension);            
            const testFileLocation = await extractCompressedFile(downloadedTarFolderPath, repoTestingDirectory, pathToTestFile);

            if(testFileLocation){
                /* 
                    TODO: contestTestJsonObject - currently is a json object imported from a javascript file, needs to be moved
                    to a JSON file. This allows us to retrieve contract owner's test cases
                */
                testResults = await testContract(testFileLocation, contestConstructorDetails, contestTestJsonObject);
            }
    
            res.status(200).json({
                "results": (testResults)
            })
        } catch (error){
            console.log(error);

            res.status(500).json({
                error: error.message
            })
        }
    } else {
        res.status(500).json({
            error: "Unable to download github repository"
        })
    }


      
}

module.exports = {
    contractSubmissionController
};