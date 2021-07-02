pragma solidity 0.6.12;

contract Contest {
    address public owner;
    
    uint public leaderScore;
    address public leaderAddress;
    
    // for contract to be started you need to have contract amount > 0
    bool public contractStarted;
    uint public contractAmount;
    
    uint public expectedContractAmount = 1000;
    
    // constructor that ensures the contract owner funds the contract on deployment
    constructor() public payable{
        require(msg.value == expectedContractAmount);
        contractAmount = msg.value;
        owner = msg.sender;
        leaderScore = 100;
    }

    function getLeaderScore() public view returns (uint) {
        return leaderScore;
    }
    
    // allowing developers to submit their score in order to determine if they're the current leaders
    function contractSubmission(uint score) public returns(bool){
        require(contractStarted && owner != msg.sender && contractAmount >= expectedContractAmount);
        if(score <= leaderScore){
            leaderScore = score;
            leaderAddress = msg.sender;   
        }
    }
    
    function beginContract() public {
        require(msg.sender == owner);
        contractStarted = true;
    }
    
    function endContract() public {
        require(msg.sender == owner);
        contractStarted = false;
    }
    
    function addMoreContractFunds() public payable {
        contractAmount += msg.value;
    }
    
    // only winner can withdraw funds
    function winnerWithdrawal() public {
        require(!contractStarted && leaderAddress == msg.sender && contractAmount >= expectedContractAmount);
        
        if(msg.sender.send(contractAmount)){
            contractAmount -= contractAmount;
            contractStarted = false;
            leaderAddress = address(0);
            leaderScore = 100;
            // THOUGHTS: WE CAN OPTIONALLY RESET THE OWNER TO A ZERO ADDRESS TO END THE CONTRACT
        }
    }
    
}
