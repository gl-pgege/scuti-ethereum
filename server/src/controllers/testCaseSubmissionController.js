const express = require('express');
const router = express.Router();        //Router() when we handle our request, we switch app to router
const fs = require('fs');
const uuid = require('uuid');

async function testCaseSubmissionController (req, res) {
    try {
        var newTestCases = {
            GithubID,
            ContestName,
            CompanyName,
            Description,
            Arguments,
            Expected_Outcome
        } = req.body;

        newTestCases.UUID = uuid.v4();

        if (!newTestCases.GithubID || !newTestCases.ContestName) {      // if theres no GithubID or Contest Name
            res.status(400).json({ msg: "Please include a Github ID and contest name."});
        }
        else if (newTestCases.GithubID.match(/\s/g)) {
            res.status(400).json({ msg: "Github ID cannot have spaces."});
        }
        else {
            var data = JSON.stringify(newTestCases, null, 2);
            // todo: remove spaces if they exist in the names
            fs.writeFile(`./JSONfiles/${newTestCases.GithubID}_${newTestCases.ContestName.replace(/\s/g, '')}.json`, data, { flag: 'w' },
            // writes file if doesnt exist, and overwrites
            err => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("File written successfully.");
                }
            })
        }
        res.status(200).json({ msg: `Test cases submitted. UUID: ${newTestCases.UUID}`});   
    }
    catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

module.exports = testCaseSubmissionController;