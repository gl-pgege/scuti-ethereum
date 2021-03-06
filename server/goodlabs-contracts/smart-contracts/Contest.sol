pragma solidity 0.6.12;

contract Contest {
    address public owner;

    uint public endTime;
    
    uint public leaderScore;
    address public leaderAddress;

    address public goodlabsAddress;

    // for contract to be started you need to have contract amount > 0
    bool public contractFunded = false;
    uint public contractAmount;

    // Modifiers
    modifier onlyOwner(){
        require(owner == msg.sender);
        _;
    }

    modifier contractIsFunded(){
        require(contractFunded);
        _;
    }
    
    // Might need to do the timestamp outside the blockchain - block.timestamp is unreliable
    modifier pastEndTime(){
        require(block.timestamp > endTime);
        _;
    }
    
    // Might need to do the timestamp outside the blockchain - block.timestamp is unreliable
    modifier beforeEndTime(){
        require(block.timestamp < endTime);
        _;
    }
    
    modifier onlyLeader(){
        require(leaderAddress == msg.sender);
        _;
    }
    
    modifier notOwner(){
        require(owner != msg.sender);
        _;
    }
    
    modifier ownerWithdrawalValidation(){
        // Might need to do the timestamp outside the blockchain - block.timestamp is unreliable
        require(leaderAddress == address(0) || (leaderAddress == address(0) && block.timestamp > endTime));
        _;
    }

    modifier onlyGoodlabs() {
        require(msg.sender == goodlabsAddress);
        _;
    }

    // constructor that ensures the contract owner funds the contract on deployment
    constructor(address _owner, uint _contractAmount, address _goodlabsAddress) public{
        owner = _owner;
        contractAmount = _contractAmount;
        leaderScore = 100;
        goodlabsAddress = _goodlabsAddress;
    }

    function getAddressZero() public pure returns(address) {
        return address(0);
    }

    function currentTime() public view returns(uint){
        return block.timestamp;
    }

    // allowing developers to submit their score in order to determine if they're the current leaders
    function contractSubmission(uint256 score) public contractIsFunded notOwner beforeEndTime{
        if(score < leaderScore){
            leaderScore = score;
            leaderAddress = msg.sender;
        }
    }
    
    function beginContract(uint _endTime) public payable onlyOwner{
        require(contractAmount == msg.value);
        endTime = _endTime;
        contractFunded = true;
    }
    
    // only winner can withdraw funds
    function transferFunds() public pastEndTime onlyGoodlabs {     
        contractAmount -= contractAmount;
        contractFunded = false;
        payable(leaderAddress).transfer(contractAmount);
    }
    
    // TODO: need to update all winnerWithdrawal() uses with transferFunds()
    function ownerWithdrawal() public onlyOwner ownerWithdrawalValidation{
        contractAmount -= contractAmount;
        contractFunded = false;
        payable(owner).transfer(contractAmount);
    }
}
