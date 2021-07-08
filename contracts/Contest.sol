pragma solidity >=0.4.21 <0.7.0;

contract Contest {
    address public owner;

 

    uint public endTime;
    uint public currentTime = block.timestamp;
    
    uint public leaderScore;
    address public leaderAddress;
    
    // for contract to be started you need to have contract amount > 0
    bool public contractStarted;
    uint public contractAmount;
    
    uint public minimumContractAmount = 1000;

 

    // Modifiers
    modifier onlyOwner(){
        require(owner == msg.sender);
        _;
    }

 

    modifier startContract(){
        require(contractStarted && owner != msg.sender && contractAmount >= minimumContractAmount);
        _;
    }

 

    modifier contractEnded(){
        require(!contractStarted && leaderAddress == msg.sender && contractAmount >= minimumContractAmount);
        _;
    }

 

    // constructor that ensures the contract owner funds the contract on deployment
    constructor(address _owner, uint _contractAmount) public{
        owner = _owner;
        contractAmount = _contractAmount;
        leaderScore = 100;
    }

 

    // function to fund the contract
    function fundContract() public payable{
        require(contractAmount == msg.value);
        contractStarted = true;
    }

 

    function getLeaderScore() public view returns (uint) {
        return leaderScore;
    }
    
    // allowing developers to submit their score in order to determine if they're the current leaders
    function contractSubmission(uint score) public startContract returns(bool){
        if(block.timestamp < endTime){    
            if(score >= leaderScore){
                return false;
            }
            
            leaderScore = score;
            leaderAddress = msg.sender;
            
            return true;
        }
        else{
            return false;
        }
    }
    
    function beginContract(uint _endTime) public onlyOwner{
        endTime = _endTime;
        contractStarted = true;
    }
    
    function endContract() public onlyOwner{
        contractStarted = false;
    }
    
    function addMoreContractFunds() public payable {
        require(msg.value >= minimumContractAmount);
        contractAmount += msg.value;
    }
    
    // only winner can withdraw funds
    function winnerWithdrawal() public contractEnded{        
        if(block.timestamp < endTime){ 
            if(payable(msg.sender).send(contractAmount)){
                contractAmount -= contractAmount;
                contractStarted = false;
                leaderAddress = address(0);
                leaderScore = 100;
                // THOUGHTS: WE CAN OPTIONALLY RESET THE OWNER TO A ZERO ADDRESS TO END THE CONTRACT
            }
        }
    }
    
}  
 