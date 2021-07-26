const dotenv = require('dotenv');

dotenv.config();

const AUTHHEADER = `token ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`;
const GITHUB_API_ROOT = "https://api.github.com"


module.exports = {
    AUTHHEADER,
    GITHUB_API_ROOT
}