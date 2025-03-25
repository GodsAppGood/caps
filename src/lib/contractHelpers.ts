
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { toast } from "@/hooks/use-toast";

// Contract ABI (you'll get this from compilation)
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "openDate",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "initialBid",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "encryptionLevel",
        "type": "string"
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
    "name": "placeBid",
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
    "name": "acceptBid",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Replace with your deployed contract address once deployed
// For testing, we'll use a placeholder
const CONTRACT_ADDRESS = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
const CAPSULE_PRICE = ethers.utils.parseEther("0.01"); // 0.01 BNB

export const createCapsuleWithPayment = async (
  name: string,
  openDate: string,
  initialBid: number,
  encryptionLevel: string
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

    // Get the provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

    // Convert initialBid to BigNumber (contract expects it in smallest unit)
    const initialBidWei = ethers.utils.parseEther(initialBid.toString());

    // Execute transaction
    const tx = await contract.createCapsule(
      name,
      openDate,
      initialBidWei,
      encryptionLevel,
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

// Add type definition for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
