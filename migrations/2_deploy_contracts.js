var Contest = artifacts.require("./Contest.sol");

module.exports = function(deployer) {
  
  // Create contract with 1 ether (contract must be payable)
  deployer.deploy(Contest, {value: "1000"});
    
  // deployer.deploy(Contest);
};

// if (accounts) {
//   // Create contract with 1 ether (contract must be payable)
//   deployer.deploy(YourContract, { from: accounts[0], value: "1000000000000000000" });
// };
