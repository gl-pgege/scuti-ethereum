const tar = require('tar-stream');
const fetch = require("node-fetch");
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

async function extractCompressedFile(downloadedTarFolderPath, repoTestingDirectory, testFilePath){
    return new Promise((resolve, reject) => {
        let extract = tar.extract();
        let chunks = {};
    
        let testFileLocation;
    
        extract.on('entry', function(header, stream, next) {
            try {

                const dirname = path.resolve(repoTestingDirectory, path.dirname(header.name));
                const filePath = path.resolve(repoTestingDirectory, header.name);
        
                if(header.name.includes(testFilePath)){
                    testFileLocation = filePath;
                }
        
                // Build github repo folder structure
                fs.mkdir(dirname, { recursive: true }, (err) => {
                    if (err) throw err;
                });
        
                // 
                stream.on('data', function(chunk) {
                    chunks[filePath] = chunk;
                });
                
                stream.on('end', function() {
                    next();
                });
        
                stream.resume();
            } catch (error) {
                reject(error.message);
            }
        });
    
        extract.on('finish', function() {
            try {
                for (let filePath in chunks) {
                    // skip loop if the property is from prototype
                    if (!chunks.hasOwnProperty(filePath)) continue;
        
                    if (chunks[filePath].length) {
                        fs.writeFileSync(filePath, chunks[filePath]);
                    }
                }
    
                if(testFileLocation){
                    resolve(testFileLocation);
                } else {
                    reject("Unsuccessful Extraction, please check test file exists");
                }
            } catch (error){
                reject(error.message)
            }
        });

        fs.createReadStream(downloadedTarFolderPath)
        .on("error", reject)
        .pipe(zlib.createGunzip())
        .on("error", reject)
        .pipe(extract)
        .on("error", reject)
        
    })
}

async function downloadRepo(url){

    // MAKE FUNCTION RETURN PROMISE

    let compressedRepoPath;

    // TODO: Add to environment variable file
    const authHeader = `token ${process.env.PERSONAL_ACCESS_TOKEN}`;
    const options = {
        method: "GET",
        headers: {
            Authorization: authHeader
        }
    };

    try{
        const response = await fetch(url, options)
        const data = await response.buffer();

        // TODO: (David) Create the "contracts" folder if it doesn't exist 
        // (create function that accepts the tar.gz folder name if contracts exists just send back path, otherwise create and send back path)
        compressedRepoPath = path.resolve(__dirname, '..', 'contracts', 'contract.tar.gz');
        
        fs.createWriteStream(compressedRepoPath).write(data);

    } catch (error){
        console.log(error);
    }

    return compressedRepoPath;
    
}

module.exports = {
    extractCompressedFile,
    downloadRepo
}