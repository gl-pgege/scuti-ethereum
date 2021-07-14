let express = require('express');
let router = express.Router();
let {contractSubmissionController} = require("../controllers/contractSubmissionController");

router.post('/contracts/id/submit', contractSubmissionController);

module.exports = router;