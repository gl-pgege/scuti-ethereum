let express = require('express');
let router = express.Router();
let { ipfsController } = require("../controllers/ipfsController");

router.post('/contracts/id/uploadToIPFS', ipfsController);

module.exports = router;