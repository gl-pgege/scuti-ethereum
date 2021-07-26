const fs = require('fs');
const uuid = require('uuid');


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
        //console.log(isValidGithubID);
        
        if (isValidGithubID) {
            if (Array.isArray(TestCases) && !(TestCases.length == 0)) {

                var data = JSON.stringify(TestCases, null, 2);

                fs.writeFile(`./JSONfiles/${GithubID}_${ContestName.replace(/\s/g, '')}.json`, data, { flag: 'w' },
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
        else {
            res.status(400).json({ msg: "Must provide a valid Github ID and Contest Name." });
        }

        // if (Array.isArray(TestCases) && !(TestCases.length === 0))
        // {
            
        // }
        // TODO: we can create a function to do this if, else if instead and convert the else into an if statement 
        // if (!GithubID || !ContestName) {      // if theres no GithubID or Contest Name
        //     res.status(400).json({ msg: "Please include a Github ID and contest name."});
        // }
        // else if (GithubID.match(/\s/g)) {
        //     res.status(400).json({ msg: "Github ID cannot have spaces."});
        // }
        // else {
        //     // check if TestCases is an array, not empty, verify if each of the propeties exists (have been provided)
        //     var data = JSON.stringify(TestCases, null, 2);
            
        //     fs.writeFile(`./JSONfiles/${GithubID}_${ContestName.replace(/\s/g, '')}.json`, data, { flag: 'w' },
        //     // writes file if doesnt exist, and overwrites
        //     err => {
        //         if (err) {
        //             console.log(err);
        //         }
        //         else {
        //             console.log("File written successfully.");
        //         }
        //     })
        //     res.status(200).json({ msg: `Test cases submitted. UUID: ${newTestCases.UUID}`});  
        // }
         
    }
    catch (error) {
        res.status(500).json({ msg: "Test cases must include a GithubID and Contest Name." });
    }
}

module.exports = testCaseSubmissionController;