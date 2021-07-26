const fetch = require("node-fetch");
const fs = require('fs');
const path = require("path");

const { 
    AUTHHEADER, 
    GITHUB_API_ROOT 
} = require("../constants/github");

function generateGithubDownloadUrl (repoName, commitId) {
    const url = `${GITHUB_API_ROOT}/repos/${process.env.GITHUB_ID}/${repoName}/tarball/${commitId}`;
    return url;
}

function generateGithubCreateRepoFromTemplateUrl(templateOwner, templateRepo){
    const url = `${GITHUB_API_ROOT}/repos/${templateOwner}/${templateRepo}/generate`
    return url;
}

function generateAddCollaboratorToRepoUrl(repo, collaboratorName){
    const url = `${GITHUB_API_ROOT}/repos/${process.env.GITHUB_ID}/${repo}/collaborators/${collaboratorName}`
    return url;
}

async function downloadRepo(url){
    // MAKE FUNCTION RETURN PROMISE

    let compressedRepoPath;

    // TODO: Add to environment variable file
    const options = {
        method: "GET",
        headers: {
            Authorization: AUTHHEADER
        }
    };

    return new Promise(async (resolve, reject) => {
        try{
            const response = await fetch(url, options)
            const data = await response.buffer();
    
            // TODO: (David) Create the "contracts" folder if it doesn't exist 
            // (create function that accepts the tar.gz folder name if contracts exists just send back path, otherwise create and send back path)
            compressedRepoPath = path.resolve(__dirname, '..',"src", 'contracts', 'contract.tar.gz');
            
            fs.createWriteStream(compressedRepoPath).write(data);
            
            resolve(compressedRepoPath);
        } catch (error){
            reject(error);
        }
    })
}

async function createGithubRepoFromTemplate(url, repoName){

    // TODO: Add to environment variable file
    const options = {
        method: "POST",
        headers: {
            Authorization: AUTHHEADER,
            Accept: "application/vnd.github.baptiste-preview+json"
        },
        body: JSON.stringify({
            name: repoName,
        })
    };

    return new Promise(async (resolve, reject) => {
        try{
            const response = await fetch(url, options);
            const data = await response.json();
                        
            resolve(data);
        } catch (error){
            reject(error);
        }
    })
    
}

async function addCollaboratorToRepo(url){

    // TODO: Add to environment variable file
    const options = {
        method: "PUT",
        headers: {
            Authorization: AUTHHEADER
        }
    };


    return new Promise(async (resolve, reject) => {
        try{
            const response = await fetch(url, options);
            const data = await response.json();
                        
            resolve(data);
        } catch (error){
            reject(error);
        }
    })
}

module.exports = {
    generateAddCollaboratorToRepoUrl,
    generateGithubCreateRepoFromTemplateUrl,
    createGithubRepoFromTemplate,
    generateGithubDownloadUrl,
    downloadRepo,
    addCollaboratorToRepo
}