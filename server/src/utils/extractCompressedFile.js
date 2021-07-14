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
        });
    
        extract.on('finish', function() {
    
            console.log(chunks);
            for (let filePath in chunks) {
                // skip loop if the property is from prototype
                if (!chunks.hasOwnProperty(filePath)) continue;
    
                if (chunks[filePath].length) {
                    // let data = Buffer.concat();
                    console.log(filePath);
                    fs.writeFileSync(filePath, chunks[filePath]);
                }
            }

            if(testFileLocation){
                resolve(testFileLocation);
            } else {
                reject("Unsuccessful Extraction, please check test file exists");
            }
        });
    
        fs.createReadStream(downloadedTarFolderPath)
            .pipe(zlib.createGunzip())
            .pipe(extract);
    })
}

module.exports = extractCompressedFile;