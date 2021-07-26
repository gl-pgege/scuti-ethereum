let express = require('express');
let router = express.Router();
let { optIntoContractController } = require("../controllers/optIntoContractController");

router.post('/contracts/id/opt-in', optIntoContractController);

module.exports = router;