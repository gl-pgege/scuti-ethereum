const compileContract = require("./compile");

async function deployContract(web3Wrapper, contractPath, contractOwner, constructorSettings={}, _gas=6700000, _gasPrice=0){
    
    // Contract compilation needs to adjust to contract name
    const {abi, evm} = compileContract(contractPath);

    const {
        arguments: constructorArguments, 
        payableAmount: constructorPayableAmount
    } = constructorSettings;
  
    return new Promise( async (resolve, reject) => {
        try {

            const gasEstimate = await web3Wrapper.eth.estimateGas({
                from: contractOwner
            })
            
            let contract = await new web3Wrapper.eth.Contract(abi).deploy({
                data: `0x${evm.bytecode.object}`,
                arguments: constructorArguments || [],
            }).send({ 
                from: contractOwner,
                gas: _gas,
                gasPrice: _gasPrice || gasEstimate,
                value: constructorPayableAmount || 0
            })
        
            resolve({
                contract,
                abi
            })
    
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = deployContract;