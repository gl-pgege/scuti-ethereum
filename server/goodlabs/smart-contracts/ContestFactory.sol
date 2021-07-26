pragma solidity 0.6.12;
import "./Contest.sol";

contract ContestFactory {

    mapping(string => address) public deployedCampaigns;

    modifier uniqueCampaignId(string memory campaignId){
        require(deployedCampaigns[campaignId] == address(0));
        _;
    }

    // address[] public deployedCampaigns;
    
    function createCampaign(string memory campaignId, uint contractAmount) uniqueCampaignId(campaignId) public {
        // deploy a new contract & store the address in newCampaign variable
        /* 
            NOTE: When we create a contract, we can be use the contract constructor
            to pass data provided to us by the user in order to allow different
            contract configurations per user
        */
        address newCampaign = address(new Contest(msg.sender, contractAmount));
        
        // push address into map of deployed campaigns
        deployedCampaigns[campaignId] = newCampaign;
        
    }
}
