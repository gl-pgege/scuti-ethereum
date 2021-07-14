const fetch = require("node-fetch");
const fs = require('fs');
const path = require('path');
const extractCompressedFile = require("../utils/extractCompressedFile");
const {testContract} = require("../utils/testHarness");
const {
    contestConstructorDetails,
    contestTestJsonObject
} = require("../constants/jsonTestValues");
const GITHUB_ID = "pgege";

// TODO: Have the filenames generated automatically
// const contractName = "styles.css";

function generateGithubDownloadUrl (githubId, repoName, commitId) {
    const url = `https://api.github.com/repos/${githubId}/${repoName}/tarball/${commitId}`;

    return url;
}

async function downloadRepo(url){

    let compressedRepoPath;

    const authHeader = "token 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";
    const options = {
        headers: {
            Authorization: authHeader
        }
    };

    try{
        const response = await fetch(url, options)
        
        const data = await response.buffer();

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
        contractName,
        pathToTestFile
    } = req.body;

    // It's our repository so 
    const url = generateGithubDownloadUrl(GITHUB_ID, repoName, commitId);
    
    const downloadedTarFolderPath = await downloadRepo(url);
    const repoTestingDirectory = path.dirname(downloadedTarFolderPath);
    let testResults;

    if(downloadedTarFolderPath){
        try {
            // const extractedContact = path.resolve(__dirname, '..', '..', '..', 'code-tests', 'contracts', contractNameWithExtension);            
            const testFileLocation = await extractCompressedFile(downloadedTarFolderPath, repoTestingDirectory, pathToTestFile);

            if(testFileLocation){
                testResults = await testContract(testFileLocation, contestConstructorDetails, contestTestJsonObject);
            }
    
            res.json({
                "results": (testResults)
            })
        } catch (error){
            console.log(error);
            //TODO - Delete repository if can't add collaborator
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