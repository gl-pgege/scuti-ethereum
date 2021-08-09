pragma solidity ^0.7.6;

/* Signature Verification

How to Sign and Verify
# Signing
1. Create message to sign
2. Hash the message
3. Sign the hash (off chain, keep your private key secret)

# Verify
1. Recreate hash from the original message
2. Recover signer from signature and hash
3. Compare recovered signer to claimed signer
*/

contract VerifySignature {

    // Signature work
    
    /*
        1. Deploy contract with MetaMask injected Web3
        2. Deposit amount and MetaMask will confirm action
        3. Locate hash in the emit logs and then open up Javascript console and assign the variable 'hash' to that hash
        4. Assign the 'account' address of the signer to a variable
        5. account = address of signer
        Then call 
           ethereum.request({ method: "personal_sign", params: [account, hash]}).then(console.log)
        This will output a signature.
           or via web3: 
           web3.personal.sign(hash, addressOfSigner, callback(err, result) {
             if (err) {
             console.log(err)
             }
             else {
                 console.log(result);   // where result = signature
             }
           })
        6. To verify signature during goodLabsWithdraw(), enter parameters: address _signer, address _to, uint _amount, uint _nonce, bytes memory signature to verify
        7. verify() will return true if it is valid and as long as the goodlabs address is calling the function, it will work
    */
    
    address public owner;
    
    // hardcoded goodlabs address for testing
    address payable constant public goodlabsAddress = 0x1e0C810194860E649312fc4bd22D00aC1E8AC717;
    
    // map of accounts (address -> accountBalance)
    // used like an array with address being the key
    mapping(address => uint256) public accounts;
    
    constructor(address _owner) {
        owner = _owner;
    }
    
    modifier onlyOwner(){
        require(owner == msg.sender);
        _;
    }
    
    modifier onlyGoodlabs() {
        require(msg.sender == goodlabsAddress);
        _;
    }
    
    function getMessageHash (address _to, uint _amount, uint _nonce) public pure returns (bytes32)
    {   
        // _to address would be our goodlabs address, contract owner is giving us permission 
        // _amount is the amount
        // _nonce is a random ID # to change the hash - need to add this because without nonce the hash is the same, regardless of the address that its sent from
        // keccak256 = hashing algorithm
        return keccak256(abi.encodePacked(_to, _amount, _nonce));
    }

    
    // recreates the hash that is actually being signed
    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
        /*
        Signature is produced by signing a keccak256 hash with the following format:
        "\x19Ethereum Signed Message\n" + len(msg) + msg
        */
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }
    
    /* Verify a signature given a message hash, checks if it equals the signer's address  */
    function verify(address _signer, address _to, uint _amount, uint _nonce, bytes memory signature) public pure returns (bool)
    {
        bytes32 messageHash = getMessageHash(_to, _amount, _nonce);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        return recoverSigner(ethSignedMessageHash, signature) == _signer;
        // returns boolean if they match
    }
    

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) public pure returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig)
        public pure returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }
    
    /*
        Gas pricing: deposit / withdraw functions takes gas, getting messageHash and signature does not
    */
    
    event DisplayHash(bytes32 _hash);
    
    function deposit() public payable {
        if(msg.value > 0) {
            accounts[msg.sender] += msg.value;
            // when the contract owner deposits, it gives goodlabs the authorization to use goodlabsWithdraw to withdraw from the escrow
            bytes32 hash = getMessageHash(goodlabsAddress, msg.value, 1);
            emit DisplayHash(hash);     // emits log that displays the _hash, use this to generate signature after user agrees 
            // figure out how to programatically sign a transaction instead of manual
        }
        else {
            revert("Please input a value greater than 0 to deposit.");
        }
    }
    
    // owner withdraw
    function withdraw(uint _amount) public onlyOwner {
        if (accounts[msg.sender] >= _amount) {
            if(payable(msg.sender).send(_amount)) {
                accounts[msg.sender] -= _amount;
            }
        } 
        else {
            revert("Insufficient funds.");
        }
    }
    
    // requires the signature to be verified
    function goodlabsWithdraw(address _signer, address _to, uint _amount, uint _nonce, bytes memory signature) public onlyGoodlabs {
        if (verify(_signer, _to, _amount, _nonce, signature)) {
            if(payable(goodlabsAddress).send(_amount)) {
                accounts[msg.sender] -= _amount;
            }
        }
        else {
            revert("Incorrect signature.");
        }
    }
    
    // returns current balance of the contract 
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}