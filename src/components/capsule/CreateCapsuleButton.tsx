
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, CreditCard } from "lucide-react";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";

interface CreateCapsuleButtonProps {
  isLoading: boolean;
  onClick: () => void;
  paymentAmount: string;
}

const RECIPIENT_ADDRESS = "0x0AbD5b7B6DE3ceA8702dAB2827D31CDA46c6e750";

const CreateCapsuleButton = ({ isLoading, onClick, paymentAmount }: CreateCapsuleButtonProps) => {
  const { toast } = useToast();

  const handlePayment = async () => {
    console.log("Payment button clicked");
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === "undefined") {
        console.log("MetaMask not detected");
        toast({
          title: "Wallet not found",
          description: "Please install MetaMask or another Ethereum wallet",
          variant: "destructive",
        });
        return;
      }

      console.log("Requesting account access from wallet");
      try {
        // Request access to the user's accounts
        await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("Account access granted");
      } catch (error) {
        console.error("Error requesting accounts:", error);
        toast({
          title: "Wallet access denied",
          description: "Please allow access to your wallet to proceed with payment",
          variant: "destructive",
        });
        return;
      }

      // Create a Web3Provider instance
      console.log("Creating Web3Provider instance");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Check if user is on BSC network
      console.log("Checking network...");
      const network = await provider.getNetwork();
      console.log("Current network:", network);
      
      // Only for BSC Mainnet (56) or BSC Testnet (97)
      if (network.chainId !== 56 && network.chainId !== 97) {
        console.log("User not on BSC network. Attempting to switch...");
        try {
          // Try to switch to BSC network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }], // 0x38 is 56 in hex (BSC Mainnet)
          });
          console.log("Successfully switched to BSC network");
        } catch (switchError: any) {
          console.log("Error while switching networks:", switchError);
          // If BSC network isn't added to MetaMask, prompt user to add it
          if (switchError.code === 4902) {
            console.log("BSC network not found in wallet, trying to add it");
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x38',
                    chainName: 'Binance Smart Chain',
                    nativeCurrency: {
                      name: 'BNB',
                      symbol: 'BNB',
                      decimals: 18,
                    },
                    rpcUrls: ['https://bsc-dataseed.binance.org/'],
                    blockExplorerUrls: ['https://bscscan.com/'],
                  },
                ],
              });
              console.log("Successfully added BSC network");
            } catch (addError) {
              console.error("Error adding BSC network:", addError);
              toast({
                title: "Network Error",
                description: "Could not add BSC network to your wallet",
                variant: "destructive",
              });
              return;
            }
          } else {
            console.error("Error switching to BSC network:", switchError);
            toast({
              title: "Network Error",
              description: "Please switch to Binance Smart Chain network",
              variant: "destructive",
            });
            return;
          }
        }
      }

      // Get the signer after potentially switching networks
      console.log("Getting updated provider after network switch");
      const updatedProvider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = updatedProvider.getSigner();
      
      // Get user address for confirmation
      try {
        const userAddress = await signer.getAddress();
        console.log("Sending payment from address:", userAddress);

        // Create transaction parameters with explicit gas settings
        const tx = {
          to: RECIPIENT_ADDRESS,
          value: ethers.utils.parseEther("0.01"), // Always 0.01 BNB
          gasLimit: ethers.utils.hexlify(21000), // Standard gas limit for simple transfers
        };

        console.log("Preparing transaction:", tx);

        // Send the transaction
        console.log("Sending transaction...");
        const transaction = await signer.sendTransaction(tx);
        console.log("Transaction sent:", transaction.hash);
        
        // Show pending toast
        toast({
          title: "Transaction Sent",
          description: "Waiting for transaction confirmation...",
        });
        
        // Wait for transaction to be mined
        console.log("Waiting for transaction confirmation...");
        const receipt = await transaction.wait();
        console.log("Transaction receipt:", receipt);

        // If transaction was successful, proceed with onClick (create capsule)
        if (receipt.status === 1) {
          toast({
            title: "Payment Successful",
            description: "Your payment of 0.01 BNB has been processed successfully",
          });
          console.log("Payment successful, creating capsule...");
          onClick();
        } else {
          toast({
            title: "Payment Failed",
            description: "Transaction was not successful",
            variant: "destructive",
          });
        }
      } catch (txError) {
        console.error("Transaction error:", txError);
        toast({
          title: "Transaction Error",
          description: "There was an error processing your transaction",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      className="w-full bg-gradient-to-r from-neon-blue to-neon-pink text-white hover:opacity-90 transition-opacity"
      onClick={handlePayment}
      disabled={isLoading}
      type="button"
    >
      {isLoading ? (
        <span className="flex items-center">
          <span className="animate-spin mr-2">⟳</span> PROCESSING PAYMENT...
        </span>
      ) : (
        <span className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" /> PAY 0.01 BNB & CREATE CAPSULE
        </span>
      )}
    </Button>
  );
};

export default CreateCapsuleButton;
