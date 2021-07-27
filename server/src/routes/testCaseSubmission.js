const express = require('express');
const router = express.Router();        //Router() when we handle our request, we switch app to router
let { testCaseSubmissionController } = require('../controllers/testCaseSubmissionController');

// Post routes
router.post('/contracts/id/testcases', testCaseSubmissionController);

module.exports = router;