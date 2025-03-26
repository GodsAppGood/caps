
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
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === "undefined") {
        toast({
          title: "Wallet not found",
          description: "Please install MetaMask or another Ethereum wallet",
          variant: "destructive",
        });
        return;
      }

      // Request access to the user's accounts
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Create a Web3Provider instance
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Check if user is on BSC network
      const network = await provider.getNetwork();
      if (network.chainId !== 56 && network.chainId !== 97) { // 56 for BSC Mainnet, 97 for BSC Testnet
        try {
          // Try to switch to BSC network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }], // 0x38 is 56 in hex (BSC Mainnet)
          });
        } catch (switchError: any) {
          // If BSC network isn't added to MetaMask, prompt user to add it
          if (switchError.code === 4902) {
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
            } catch (addError) {
              toast({
                title: "Network Error",
                description: "Could not add BSC network to your wallet",
                variant: "destructive",
              });
              return;
            }
          } else {
            toast({
              title: "Network Error",
              description: "Please switch to Binance Smart Chain network",
              variant: "destructive",
            });
            return;
          }
        }
      }

      // Get the signer
      const signer = provider.getSigner();

      // Create transaction parameters
      const tx = {
        to: RECIPIENT_ADDRESS,
        value: ethers.utils.parseEther("0.01"), // Always 0.01 BNB
      };

      // Send the transaction
      const transaction = await signer.sendTransaction(tx);
      
      // Wait for transaction to be mined
      const receipt = await transaction.wait();

      // If transaction was successful, proceed with onClick (create capsule)
      if (receipt.status === 1) {
        toast({
          title: "Payment Successful",
          description: "Your payment of 0.01 BNB has been processed successfully",
        });
        onClick();
      } else {
        toast({
          title: "Payment Failed",
          description: "Transaction was not successful",
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
