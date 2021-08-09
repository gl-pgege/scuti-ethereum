const fs = require("fs");
const path = require('path');
const { create } = require("ipfs-http-client");
const ipfs = create({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' });

async function addFile (fileName, filePath) {
    const file = fs.readFileSync(filePath);
    const filesAdded = await ipfs.add({ path: fileName, content: file });
    console.log(filesAdded);
    const fileHash = filesAdded.cid.toString();

    return fileHash;
};

/* integrate this into scuti
1) submit test cases via API route
2) json file will be created with test cases
3) change path to that folder and add route where user can enter name of .json file
4) test upload to ipfs with hash
*/
async function ipfsController(fileName) {
    const testFilePath = path.resolve("..", "JSONfiles", fileName);
    // console.log(testFilePath);
    // CID = content identifier, is a label used to point to material in IPFS. DOesn't include where the 
    // content is stored, but it forms a kind of address based on the content itself, so the same content with different
    // nodes will produce the same CID
    // IPFS uses SHA-256 hashing algorithm by default
    let cid;
    try {
        cid = await addFile(fileName, testFilePath)
        // the HASH url is how to read a file using API
        console.log(`File name: ${fileName}, Hash: https://ipfs.infura.io:5001/api/v0/cat?arg=${cid}`);
    }
    catch(err) {
        console.log(`Could not find file ${fileName}`);
    }
}
ipfsController("ddang_mycontest2.json");
module.exports = { ipfsController };