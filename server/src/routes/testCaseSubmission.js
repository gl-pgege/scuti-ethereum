// routes
const express = require('express');
const testCaseRouter = express.Router();        //Router() when we handle our request, we switch app to router
let testCaseController = require('../controllers/testCaseSubmissionController');

// Post routes
testCaseRouter.post('/contract/id/testcases', testCaseController);

module.exports = testCaseRouter;