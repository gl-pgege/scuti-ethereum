let express = require('express');
let router = express.Router();     
let { githubRepoController } = require('../controllers/githubRepoController');

router.get('/contracts/id/transferFunds', githubRepoController);

module.exports = router;