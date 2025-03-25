
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { toast } from "@/hooks/use-toast";
import { create } from 'ipfs-http-client';

// Contract ABI (updated for the new contract)
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "capsuleId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "bidder",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "bidAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "BidAccepted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "bidder",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "capsuleId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "bidAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "BidPlaced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "capsuleId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "unlockTime",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "CapsuleCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "capsuleId",
        "type": "uint256"
      }
    ],
    "name": "acceptBid",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "capsules",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "address payable",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "address payable",
        "name": "highestBidder",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "highestBid",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "unlockTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isOpen",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_ipfsHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_unlockTime",
        "type": "uint256"
      }
    ],
    "name": "createCapsule",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "capsuleId",
        "type": "uint256"
      }
    ],
    "name": "getCapsuleContent",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "capsuleId",
        "type": "uint256"
      }
    ],
    "name": "isCapsuleOpen",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextCapsuleId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "capsuleId",
        "type": "uint256"
      }
    ],
    "name": "placeBid",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Replace with your deployed contract address once deployed
const CONTRACT_ADDRESS = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
const CAPSULE_PRICE = ethers.utils.parseEther("0.01"); // 0.01 BNB

// IPFS configuration
const projectId = "YOUR_INFURA_PROJECT_ID"; // Replace with your Infura project ID
const projectSecret = "YOUR_INFURA_PROJECT_SECRET"; // Replace with your Infura secret
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

// Initialize IPFS client (Uncomment when you have your Infura credentials)
// const ipfsClient = create({
//   host: 'ipfs.infura.io',
//   port: 5001,
//   protocol: 'https',
//   headers: {
//     authorization: auth
//   }
// });

// Upload content to IPFS
export const uploadToIPFS = async (
  content: string | File
): Promise<string> => {
  try {
    // For demonstration purposes - this should be replaced with actual IPFS upload
    // When you have your Infura credentials
    
    // If it's a file
    // if (content instanceof File) {
    //   const fileAdded = await ipfsClient.add(content);
    //   return fileAdded.path;
    // } 
    
    // If it's a string
    // const stringAdded = await ipfsClient.add(content);
    // return stringAdded.path;
    
    // For now, return a mock hash
    const mockHash = "Qm" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log("Mock IPFS hash generated:", mockHash);
    return mockHash;
  } catch (error: any) {
    console.error("Error uploading to IPFS:", error);
    toast({
      title: "IPFS Upload Error",
      description: error.message || "Failed to upload content to IPFS",
      variant: "destructive",
    });
    throw error;
  }
};

// Create a new capsule with IPFS content
export const createCapsuleWithPayment = async (
  name: string,
  content: string | File,
  unlockTime: number
): Promise<boolean> => {
  try {
    // Check if window.ethereum exists (MetaMask or similar wallet)
    if (!window.ethereum) {
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or a compatible wallet.",
        variant: "destructive",
      });
      return false;
    }

    // First upload content to IPFS
    const ipfsHash = await uploadToIPFS(content);

    // Get the provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

    // Execute transaction
    const tx = await contract.createCapsule(
      name,
      ipfsHash,
      unlockTime,
      { value: CAPSULE_PRICE }
    );

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    toast({
      title: "Capsule Created",
      description: "Your capsule has been created successfully on the blockchain!",
    });
    
    return true;
  } catch (error: any) {
    console.error("Error creating capsule with payment:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to create capsule with payment",
      variant: "destructive",
    });
    return false;
  }
};

// Place a bid on a capsule through the smart contract
export const placeBidOnChain = async (
  capsuleId: string,
  bidAmount: number
): Promise<boolean> => {
  try {
    // Check if window.ethereum exists
    if (!window.ethereum) {
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or a compatible wallet.",
        variant: "destructive",
      });
      return false;
    }

    // Get the provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

    // Convert bid amount to wei
    const bidAmountWei = ethers.utils.parseEther(bidAmount.toString());

    // Execute transaction
    const tx = await contract.placeBid(Number(capsuleId), { value: bidAmountWei });

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    toast({
      title: "Bid Placed",
      description: `Your bid of ${bidAmount} BNB has been placed successfully on the blockchain!`,
    });
    
    return true;
  } catch (error: any) {
    console.error("Error placing bid on chain:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to place bid on the blockchain",
      variant: "destructive",
    });
    return false;
  }
};

// Accept a bid through the smart contract
export const acceptBidOnChain = async (
  capsuleId: string
): Promise<boolean> => {
  try {
    // Check if window.ethereum exists
    if (!window.ethereum) {
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or a compatible wallet.",
        variant: "destructive",
      });
      return false;
    }

    // Get the provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

    // Execute transaction
    const tx = await contract.acceptBid(Number(capsuleId));

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    toast({
      title: "Bid Accepted",
      description: "You have successfully accepted the bid on the blockchain!",
    });
    
    return true;
  } catch (error: any) {
    console.error("Error accepting bid on chain:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to accept bid on the blockchain",
      variant: "destructive",
    });
    return false;
  }
};

// Check if a capsule is open
export const isCapsuleOpenOnChain = async (
  capsuleId: string
): Promise<boolean> => {
  try {
    // Check if window.ethereum exists
    if (!window.ethereum) {
      console.error("No Ethereum wallet found");
      return false;
    }

    // Get the provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Create contract instance (read-only)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

    // Call the view function
    const isOpen = await contract.isCapsuleOpen(Number(capsuleId));
    
    return isOpen;
  } catch (error: any) {
    console.error("Error checking if capsule is open:", error);
    return false;
  }
};

// Get capsule content (if open)
export const getCapsuleContentFromChain = async (
  capsuleId: string
): Promise<string> => {
  try {
    // Check if window.ethereum exists
    if (!window.ethereum) {
      console.error("No Ethereum wallet found");
      return "";
    }

    // Get the provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Create contract instance (read-only)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

    // First check if capsule is open
    const isOpen = await contract.isCapsuleOpen(Number(capsuleId));
    
    if (!isOpen) {
      toast({
        title: "Capsule Locked",
        description: "This capsule is not open yet.",
        variant: "destructive",
      });
      return "";
    }
    
    // Get the content IPFS hash
    const ipfsHash = await contract.getCapsuleContent(Number(capsuleId));
    
    return ipfsHash;
  } catch (error: any) {
    console.error("Error getting capsule content:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to get capsule content",
      variant: "destructive",
    });
    return "";
  }
};

// Add type definition for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
