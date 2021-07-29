const tar = require('tar-stream');
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
                reject(error);
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
                    reject(new Error("Unsuccessful Extraction, please check test file exists"));
                }
            } catch (error){
                reject(error)
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

function extractFileNameFromPath(path){
    return path.replace(/^.*[\\\/]/, '');
}

async function generateFolderIfNotExist(directoryPath) {
    return new Promise((resolve, reject) => {
        try {
            const dir = path.resolve(directoryPath);    
            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath);
                resolve(path.resolve(directoryPath));
            }
            else {
                resolve(dir);
            }
        }
        catch(error) {
            reject(error);
        }
    })
}

module.exports = {
    extractCompressedFile,
    extractFileNameFromPath,
    generateFolderIfNotExist
}