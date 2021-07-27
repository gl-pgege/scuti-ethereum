const fs = require("fs");
const path = require("path");
const solc = require("solc");
const {extractFileNameFromPath} = require("./fileUtils");

String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

function parseRootDirectoryForSolidityFiles(directory) {

    let files = [];

    fs.readdirSync(directory).forEach(file => {
        const absolutePath = path.join(directory, file);
        if (fs.existsSync(absolutePath) && fs.lstatSync(absolutePath).isDirectory()) {
            return;
        } else {
            return files.push(absolutePath);
        } 
    });

    return files;
}

function recursivelyAddAllImports(filePath, sourcesPropertyName, _sources={}, prepend){

    const sources = {..._sources};

    const directory = path.dirname(filePath);
    const source = fs.readFileSync(filePath, "utf-8");    
    const sourceArray = source.split("\n");

    sources[sourcesPropertyName] = {
        content: source
    }

    for(let i = 0; i < sourceArray.length; i++){
        let line = sourceArray[i];

        // TODO: Work on supporting other import types such as "../" or from github etc..
        if(line.includes("import")){
            const relativePath = line.match(/"((?:[^"]|(?<=\\)")*)"/)[1]
            let propertyName;

            if(relativePath.includes("./")){
                propertyName = relativePath.replace("./", "");
                
                if(prepend){
                    propertyName = `${prepend}/${propertyName}`
                }
            } else if (relativePath.includes("../")){ 
                //TODO: Proper property name needs to be determined for this case
                propertyName = relativePath.replace("../", "");
            }

            const fileAbsolutePath = path.resolve(directory, ...relativePath.split("/"));
            const currentDirectory = path.dirname(fileAbsolutePath).split(path.sep).pop();

            recursivelyAddAllImports(fileAbsolutePath, propertyName, sources, currentDirectory);

        } else if (line.includes("{")) { // Stop searching for imports once you see an opening brace in source code
            break;
        }
    }

    return sources;
}

function generateSourceFilesForAllContracts(directory, _sources={}){

    let sources = {..._sources};

    const filePaths = parseRootDirectoryForSolidityFiles(directory)

    filePaths.forEach(filePath => {
        const fileName = extractFileNameFromPath(filePath);        
        
        sources = recursivelyAddAllImports(filePath, fileName, sources);
    })

    return sources;
}

function compileContract(contractPath){

    // const version = getSolcVersions(contractPath);

    const contractFileName = extractFileNameFromPath(contractPath);
    const contractName = contractFileName.replace(".sol", "");

    const contractsFolder = path.dirname(contractPath)
     
    const sources = generateSourceFilesForAllContracts(contractsFolder);
  
    // needs to adjust to contract name
    const input = {
        language: "Solidity",
        sources: {...sources},
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };
  
    const compiledContract = JSON.parse(solc.compile(JSON.stringify(input)));
    try {
        return compiledContract.contracts[contractFileName][contractName];
    } catch (error) {
        console.log(compiledContract)
        throw new Error(`Failed to compile ${contractFileName}`)
    }
    
  
}

function getSolcVersion(filePath) {
    const source = fs.readFileSync(filePath, "utf-8");    
    const sourceArray = source.split("\n");

    let solc_version;

    sourceArray.forEach(line => {
        // TODO: Work on supporting other import types such as "../" or from github etc..
        if(line.includes("pragma solidity")){
            const version = line.replace("pragma solidity ", "")
                            .replace(";", "")
                            .replaceAll(".", "")
                            .replaceAll("/-/g", "");

            solc_version = version;
        }
    });

    return solc_version;
}

module.exports = compileContract;