import React, { useEffect, useState } from "react";
import Contest from "./contracts/Contest.json";
import getWeb3 from "./getWeb3";

import "./App.css";

function App(){

  const [storageValue, setStorageValue] = useState(0);
  const [web3, setWeb3] = useState();
  const [accounts, setAccounts] = useState();
  const [contract, setContract] = useState();
  const [userScore, setUserScore] = useState(0);

  useEffect(() => {

    async function test(){
      try {
        // Get network provider and web3 instance.
        const web3_instance = await getWeb3();

        // console.log(web3_instance.eth.getAccounts())
        // Use web3 to get the user's accounts.
        const initial_accounts = await web3_instance.eth.getAccounts();
        console.log(initial_accounts);

        // Get the contract instance.
        const networkId = await web3_instance.eth.net.getId();
        const deployedNetwork = Contest.networks[networkId];

        console.log(Contest);

        //DEPLOYING OUR SMARTCONTRACT USING JS
        // const contestContract = new web3_instance.eth.Contract(Contest.abi);
        // const instance = await contestContract.deploy({  
        //         data: Contest.bytecode,
        //     }).send({
        //       from: initial_accounts[0],
        //       gas: 1500000,
        //       gasPrice: '2000000',
        //       value: 1000
        //     });
  
        const instance = new web3_instance.eth.Contract(
          Contest.abi,
          deployedNetwork && deployedNetwork.address
        );
  
        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        setWeb3(web3_instance);
        setAccounts(initial_accounts);
        setContract(instance);
      } catch (error) {
        // Catch any errors for any of the above operations.
        console.error(error);
      }
  
    }

    test();
  }, [])

  async function submitScore() {

    try{
      
      // beginning the contract
      await contract.methods.beginContract().send({ from: accounts[0] });
      // // Changes current leaders score 
      await contract.methods.contractSubmission(userScore).send({ from: accounts[1] });

      // console.log("Response", response);
    } catch (error){
      console.log("Error", error)
    }
  }

  async function retrieveScore(){
    try {

      await web3.eth.sendTransaction({to:"0xbb8eAFcD5502a0a6BA2a353f03eb3AB28049DD7A", from:"0x578688bB42919b9eEfa011bc0192BF9D4Eaf491E", value: web3.utils.toWei("1", "ether")})
      // // Get the value from the contract to prove it worked.
      // const response = await contract.methods.getLeaderScore().call();
      // console.log(response);
      // // Update state with the result.
      // setStorageValue(response);
    } catch(error){
      console.log(error);
    }
  }

  function renderWeb3Loading(){
    return (
      <div>Loading Web3, accounts, and contract...</div>
    )
  }

  return (
    <div>
      { !web3 ? 
        renderWeb3Loading() : 
        <div className="App">
          <h2>Smart Contract Example</h2>
          <input type="number" value={userScore} onChange={(e) => setUserScore(e.target.value)} />
          <button onClick={() => {submitScore()}}>
            Submit Score!
          </button>
          <p>
            Click to submit score
          </p>
          <button onClick={() => {retrieveScore()}}>
            Get Current LeaderScore!
          </button>

          <p>The stored value is: {storageValue}</p>
        </div>    
      }
    </div>
  )
}

export default App;
