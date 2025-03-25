
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CapsuleContract {
    // Fixed price for creating a capsule (0.01 BNB)
    uint256 public constant CAPSULE_PRICE = 10000000000000000; // 0.01 BNB in wei
    
    // Minimum bid increment percentage (10%)
    uint256 public constant MIN_BID_INCREMENT_PERCENT = 10;

    // Platform fee percentage (2%)
    uint256 public constant PLATFORM_FEE_PERCENT = 2;

    // Owner of the contract who can withdraw funds
    address public owner;
    
    // Counter for capsule IDs
    uint256 public nextCapsuleId = 1;

    // Event emitted when a new capsule is created
    event CapsuleCreated(
        uint256 indexed capsuleId,
        string name,
        address indexed creator,
        uint256 unlockTime,
        string ipfsHash,
        uint256 timestamp
    );
    
    // Event emitted when a bid is placed
    event BidPlaced(
        address indexed bidder,
        uint256 indexed capsuleId,
        uint256 bidAmount,
        uint256 timestamp
    );
    
    // Event emitted when a bid is accepted
    event BidAccepted(
        uint256 indexed capsuleId,
        address indexed bidder,
        uint256 bidAmount,
        uint256 timestamp
    );

    // Mapping to store capsule data
    struct Capsule {
        string name;
        address payable creator;
        address payable highestBidder;
        uint256 highestBid;
        uint256 unlockTime; // Time when the capsule opens
        bool isOpen;
        string ipfsHash; // IPFS link to content
    }
    
    // Mapping from capsule ID to Capsule data
    mapping(uint256 => Capsule) public capsules;

    constructor() {
        owner = msg.sender;
    }

    // Function to create a new capsule
    function createCapsule(
        string memory _name,
        string memory _ipfsHash,
        uint256 _unlockTime
    ) external payable {
        // Check that the sender has sent exactly 0.01 BNB
        require(msg.value == CAPSULE_PRICE, "Payment must be exactly 0.01 BNB");
        require(_unlockTime > block.timestamp, "Unlock time must be in the future");

        // Create new capsule
        uint256 capsuleId = nextCapsuleId;
        capsules[capsuleId] = Capsule({
            name: _name,
            creator: payable(msg.sender),
            highestBidder: payable(address(0)),
            highestBid: 0,
            unlockTime: _unlockTime,
            isOpen: false,
            ipfsHash: _ipfsHash
        });
        
        nextCapsuleId++;

        // Emit event with capsule details
        emit CapsuleCreated(
            capsuleId,
            _name,
            msg.sender,
            _unlockTime,
            _ipfsHash,
            block.timestamp
        );
    }
    
    // Function to place a bid on a capsule
    function placeBid(uint256 capsuleId) external payable {
        Capsule storage capsule = capsules[capsuleId];
        
        // Check that capsule exists
        require(capsule.creator != address(0), "Capsule does not exist");
        
        // Check that capsule is not already open
        require(!capsule.isOpen, "Capsule is already open");
        
        // Check that current time is before unlock time
        require(block.timestamp < capsule.unlockTime, "Capsule unlock time has passed");
        
        // Check that bid is higher than current bid by at least 10%
        if(capsule.highestBid > 0) {
            uint256 minimumBid = capsule.highestBid + (capsule.highestBid * MIN_BID_INCREMENT_PERCENT / 100);
            require(msg.value >= minimumBid, "Bid must be at least 10% higher than current bid");
        }
        
        // If there was a previous bidder, refund them
        if (capsule.highestBidder != address(0)) {
            capsule.highestBidder.transfer(capsule.highestBid);
        }
        
        // Update capsule with new bid
        capsule.highestBid = msg.value;
        capsule.highestBidder = payable(msg.sender);
        
        // Emit event for bid placement
        emit BidPlaced(
            msg.sender,
            capsuleId,
            msg.value,
            block.timestamp
        );
    }
    
    // Function to accept a bid (only callable by capsule creator)
    function acceptBid(uint256 capsuleId) external {
        Capsule storage capsule = capsules[capsuleId];
        
        // Check that sender is the capsule creator
        require(msg.sender == capsule.creator, "Only capsule creator can accept bids");
        
        // Check that there is a valid bid
        require(capsule.highestBidder != address(0), "No bids to accept");
        
        // Check that capsule is not already open
        require(!capsule.isOpen, "Capsule is already open");
        
        // Mark capsule as open and set unlock time to now
        capsule.isOpen = true;
        capsule.unlockTime = block.timestamp; // Capsule opens immediately after bid acceptance
        
        // Calculate platform fee (2%)
        uint256 platformFee = capsule.highestBid * PLATFORM_FEE_PERCENT / 100;
        uint256 creatorPayment = capsule.highestBid - platformFee;
        
        // Transfer funds to creator and platform
        payable(owner).transfer(platformFee);
        capsule.creator.transfer(creatorPayment);
        
        // Emit event for bid acceptance
        emit BidAccepted(
            capsuleId,
            capsule.highestBidder,
            capsule.highestBid,
            block.timestamp
        );
    }
    
    // Function to check if a capsule is open (either by time or by accepted bid)
    function isCapsuleOpen(uint256 capsuleId) public view returns (bool) {
        Capsule storage capsule = capsules[capsuleId];
        // Capsule is open if it's marked as open or if the unlock time has passed
        return capsule.isOpen || block.timestamp >= capsule.unlockTime;
    }
    
    // Function to get capsule content (only if open)
    function getCapsuleContent(uint256 capsuleId) public view returns (string memory) {
        require(isCapsuleOpen(capsuleId), "Capsule is not open yet");
        return capsules[capsuleId].ipfsHash;
    }

    // Function for the owner to withdraw funds
    function withdraw() external {
        require(msg.sender == owner, "Only the owner can withdraw funds");
        payable(owner).transfer(address(this).balance);
    }
}
