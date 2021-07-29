let express = require('express');
let router = express.Router();     
let { contestInformationController } = require('../controllers/contestInformationController');

router.get('/contracts/id/contestinformation', contestInformationController);

module.exports = router;