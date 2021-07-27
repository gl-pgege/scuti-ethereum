const fs = require('fs');
const uuid = require('uuid');
const { generateFolderIfNotExist } = require('../../utils/fileUtils');
const path = require('path');

//TODO: move this to a utils file and export / import 
function validGithubID(GithubID, ContestName) {
    if ((GithubID.match(/\s/g)) || !GithubID || !ContestName) {
        return false;
    }
    return true;
}

async function testCaseSubmissionController (req, res) {
    
    try {
        var newTestCases = {
            GithubID,
            ContestName,
            CompanyName,
            Description,
            TestCases
        } = req.body;
        newTestCases.UUID = uuid.v4();

        let isValidGithubID = validGithubID(GithubID, ContestName);
        
        if (isValidGithubID) {
            try {
                if (Array.isArray(TestCases) && !(TestCases.length == 0)) {
                    var data = JSON.stringify(TestCases, null, 2);
                    
                    var jsonFolderPath = generateFolderIfNotExist(path.resolve(__dirname, '..', 'JSONfiles'));
                    
                    fs.writeFile(path.resolve(jsonFolderPath, `${GithubID}_${ContestName.replace(/\s/g, '')}.json`), data, { flag: 'w' },
                    // writes file if doesnt exist, and overwrites
                    err => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("File written successfully.");
                        }
                    })
                    res.status(200).json({ msg: `Test cases submitted. UUID: ${newTestCases.UUID}`});  
                }
                else {
                    res.status(400).json({ msg: "Test cases must be in an array and not empty." });
                }
            }
            catch(err) {
                res.status(400).json({ msg: err.message });
            }
        }
        else {
            res.status(400).json({ msg: "Test cases must include a valid Github ID and Contest Name." });
        }
    }
    catch (error) {
        res.status(500).json({ msg: "Test cases must include a valid Github ID and Contest Name." });
    }
}

module.exports = { testCaseSubmissionController };