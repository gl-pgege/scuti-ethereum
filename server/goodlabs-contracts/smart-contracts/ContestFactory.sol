pragma solidity 0.6.12;

import "./Contest.sol";

contract ContestFactory {

    struct ContestData {
        string id;
        address contractAddress;
        string contractOwnerId;
        address contractOwnerAddress;
    }

    ContestData[] public deployedCampaigns;

    // modifier uniqueCampaignId(string memory campaignId){
    //     require(deployedCampaigns[campaignId] == address(0));
    //     _;
    // }

    // address[] public deployedCampaigns;
    
    function getContestCount() public view returns(uint count) {
        return deployedCampaigns.length;
    }
    
    function createCampaign(string memory campaignId, string memory contractOwnerId, uint contractAmount) public {
        // deploy a new contract & store the address in newCampaign variable
        /* 
            NOTE: When we create a contract, we can be use the contract constructor
            to pass data provided to us by the user in order to allow different
            contract configurations per user
        */
        // the goodlabs address (3rd parameter is hardcoded for testing - it is account 3 in Metamask)
        address newCampaignAddress = address(new Contest(msg.sender, contractAmount, address(0x1e0C810194860E649312fc4bd22D00aC1E8AC717)));

        ContestData memory campaign = ContestData(campaignId, newCampaignAddress, contractOwnerId, msg.sender);
        
        // push address into map of deployed campaigns
        deployedCampaigns.push(campaign);
        
    }
}