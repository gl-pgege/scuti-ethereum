const fs = require("fs");
const path = require('path');
const { create } = require("ipfs-http-client");
const ipfs = create("https://ipfs.infura.io:5001/");


const addFile = async (fileName, filePath) => {
    const file = fs.readFileSync(filePath);
    const filesAdded = await ipfs.add({ path: fileName, content: file });
    console.log(filesAdded);
    const fileHash = filesAdded.cid.toString();

    return fileHash;
};

async function main() {
    const fileName = "testFile.json";
    const testFilePath = path.resolve(".", fileName);

    const cid = await addFile(fileName, testFilePath)
    console.log(cid);
}

main();