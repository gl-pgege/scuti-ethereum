let express = require('express');
let router = express.Router();     
let { testCaseSubmissionController } = require('../controllers/testCaseSubmissionController');

router.post('/contracts/id/testcases', testCaseSubmissionController);

module.exports = router;