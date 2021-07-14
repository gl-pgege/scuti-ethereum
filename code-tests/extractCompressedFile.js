const tar = require('tar-stream');
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

let extract = tar.extract();
let chunks = {};

extract.on('entry', function(header, stream, next) {
    
    const dirname = path.resolve(__dirname, "contracts", path.dirname(header.name))
    const filePath = path.resolve(__dirname, "contracts", header.name);

    fs.mkdir(dirname, { recursive: true }, (err) => {
        if (err) throw err;
    });

    stream.on('data', function(chunk) {
        chunks[filePath] = chunk;
    });
    
    stream.on('end', function() {
        next();
    });

    stream.resume();
});

extract.on('finish', function() {

    for (let filePath in chunks) {
        // skip loop if the property is from prototype
        if (!chunks.hasOwnProperty(filePath)) continue;

        if (chunks[filePath].length) {
            // let data = Buffer.concat();
            console.log(filePath);
            fs.writeFileSync(filePath, chunks[filePath]);
        }
    }
});

fs.createReadStream('./contracts/contract.tar.gz')
    .pipe(zlib.createGunzip())
    .pipe(extract);