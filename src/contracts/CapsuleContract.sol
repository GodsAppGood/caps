
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CapsuleContract {
    // Fixed price for creating a capsule (0.01 BNB)
    uint256 public constant CAPSULE_PRICE = 10000000000000000; // 0.01 BNB in wei
    
    // Minimum bid increment percentage (10%)
    uint256 public constant MIN_BID_INCREMENT_PERCENT = 10;

    // Platform fee percentage (2%)
    uint256 public constant PLATFORM_FEE_PERCENT = 2;

    // Event emitted when a new capsule is created
    event CapsuleCreated(
        address indexed creator,
        string name,
        string openDate,
        uint256 initialBid,
        string encryptionLevel,
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
        address indexed creator,
        address indexed bidder,
        uint256 indexed capsuleId,
        uint256 bidAmount,
        uint256 timestamp
    );

    // Owner of the contract who can withdraw funds
    address public owner;
    
    // Mapping to store capsule data
    struct Capsule {
        address creator;
        string name;
        string openDate;
        uint256 initialBid;
        uint256 currentBid;
        address highestBidder;
        bool isOpen;
        string encryptionLevel;
        uint256 auctionEndTime; // Timestamp when the auction ends (optional)
    }
    
    // Mapping from capsule ID to Capsule data
    mapping(uint256 => Capsule) public capsules;
    
    // Counter for capsule IDs
    uint256 public nextCapsuleId = 1;

    constructor() {
        owner = msg.sender;
    }

    // Function to create a new capsule
    function createCapsule(
        string memory name,
        string memory openDate,
        uint256 initialBid,
        string memory encryptionLevel
    ) external payable {
        // Check that the sender has sent exactly 0.01 BNB
        require(msg.value == CAPSULE_PRICE, "Payment must be exactly 0.01 BNB");

        // Create new capsule
        uint256 capsuleId = nextCapsuleId;
        capsules[capsuleId] = Capsule({
            creator: msg.sender,
            name: name,
            openDate: openDate,
            initialBid: initialBid,
            currentBid: initialBid,
            highestBidder: address(0),
            isOpen: false,
            encryptionLevel: encryptionLevel,
            auctionEndTime: 0 // No auction end time by default
        });
        
        nextCapsuleId++;

        // Emit event with capsule details
        emit CapsuleCreated(
            msg.sender,
            name,
            openDate,
            initialBid,
            encryptionLevel,
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
        
        // Check if auction has ended (if auctionEndTime is set)
        if (capsule.auctionEndTime > 0) {
            require(block.timestamp < capsule.auctionEndTime, "Auction has ended");
        }
        
        // Check that bid is higher than current bid by at least 10%
        uint256 minimumBid = capsule.currentBid + (capsule.currentBid * MIN_BID_INCREMENT_PERCENT / 100);
        require(msg.value >= minimumBid, "Bid must be at least 10% higher than current bid");
        
        // If there was a previous bidder, refund them
        if (capsule.highestBidder != address(0)) {
            payable(capsule.highestBidder).transfer(capsule.currentBid);
        }
        
        // Update capsule with new bid
        capsule.currentBid = msg.value;
        capsule.highestBidder = msg.sender;
        
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
        
        // Mark capsule as open
        capsule.isOpen = true;
        
        // Calculate platform fee (2%)
        uint256 platformFee = capsule.currentBid * PLATFORM_FEE_PERCENT / 100;
        uint256 creatorPayment = capsule.currentBid - platformFee;
        
        // Transfer funds to creator and platform
        payable(capsule.creator).transfer(creatorPayment);
        payable(owner).transfer(platformFee);
        
        // Emit event for bid acceptance
        emit BidAccepted(
            capsule.creator,
            capsule.highestBidder,
            capsuleId,
            capsule.currentBid,
            block.timestamp
        );
    }

    // Function to set an auction end time (optional, only callable by capsule creator)
    function setAuctionEndTime(uint256 capsuleId, uint256 endTime) external {
        Capsule storage capsule = capsules[capsuleId];
        
        // Check that sender is the capsule creator
        require(msg.sender == capsule.creator, "Only capsule creator can set auction end time");
        
        // Check that capsule is not already open
        require(!capsule.isOpen, "Capsule is already open");
        
        // Check that end time is in the future
        require(endTime > block.timestamp, "End time must be in the future");
        
        // Set auction end time
        capsule.auctionEndTime = endTime;
    }
    
    // Function to finalize an auction that has ended by time (callable by anyone)
    function finalizeTimedAuction(uint256 capsuleId) external {
        Capsule storage capsule = capsules[capsuleId];
        
        // Check that capsule exists
        require(capsule.creator != address(0), "Capsule does not exist");
        
        // Check that capsule is not already open
        require(!capsule.isOpen, "Capsule is already open");
        
        // Check that auction end time is set and has passed
        require(capsule.auctionEndTime > 0, "No auction end time set");
        require(block.timestamp >= capsule.auctionEndTime, "Auction has not ended yet");
        
        // Check that there is a valid bid
        require(capsule.highestBidder != address(0), "No bids to finalize");
        
        // Mark capsule as open
        capsule.isOpen = true;
        
        // Calculate platform fee (2%)
        uint256 platformFee = capsule.currentBid * PLATFORM_FEE_PERCENT / 100;
        uint256 creatorPayment = capsule.currentBid - platformFee;
        
        // Transfer funds to creator and platform
        payable(capsule.creator).transfer(creatorPayment);
        payable(owner).transfer(platformFee);
        
        // Emit event for bid acceptance
        emit BidAccepted(
            capsule.creator,
            capsule.highestBidder,
            capsuleId,
            capsule.currentBid,
            block.timestamp
        );
    }

    // Function for the owner to withdraw funds
    function withdraw() external {
        require(msg.sender == owner, "Only the owner can withdraw funds");
        payable(owner).transfer(address(this).balance);
    }
}
