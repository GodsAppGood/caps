
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CapsuleContract {
    // Fixed price for creating a capsule (0.01 BNB)
    uint256 public constant CAPSULE_PRICE = 10000000000000000; // 0.01 BNB in wei

    // Event emitted when a new capsule is created
    event CapsuleCreated(
        address indexed creator,
        string name,
        string openDate,
        uint256 initialBid,
        string encryptionLevel,
        uint256 timestamp
    );

    // Owner of the contract who can withdraw funds
    address public owner;

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

    // Function for the owner to withdraw funds
    function withdraw() external {
        require(msg.sender == owner, "Only the owner can withdraw funds");
        payable(owner).transfer(address(this).balance);
    }
}
