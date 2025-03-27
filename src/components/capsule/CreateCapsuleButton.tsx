
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { checkWalletConnection, switchToBscNetwork, openWalletModal } from "@/utils/walletUtils";
import { processCapsulePayment } from "@/utils/capsuleCreationUtils";
import { useCapsuleCreation } from "@/contexts/CapsuleCreationContext";

interface CreateCapsuleButtonProps {
  isLoading: boolean;
  onClick: (success: boolean, txHash?: string) => void;
  paymentAmount: string;
  paymentMethod: number; // 0 = BNB, 1 = ETH
  onValidate: () => boolean;
}

const CreateCapsuleButton = ({ isLoading, onClick, paymentAmount, paymentMethod, onValidate }: CreateCapsuleButtonProps) => {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const [processingPayment, setProcessingPayment] = useState(false);
  const { setIsLoading } = useCapsuleCreation();

  const handlePayment = async () => {
    if (processingPayment) {
      console.log("Payment already processing, skipping...");
      return;
    }

    // Validate form data first
    if (!onValidate()) {
      return;
    }

    setIsLoading(true);
    setProcessingPayment(true);
    
    try {
      // Check if wallet is connected
      if (!isConnected || !address) {
        console.log("Wallet not connected");
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to proceed with payment",
          variant: "destructive",
        });
        
        // Trigger wallet connection via Web3Modal
        openWalletModal();
        setProcessingPayment(false);
        setIsLoading(false);
        return;
      }

      // Make sure ethereum provider exists in window
      if (typeof window === 'undefined' || !window.ethereum) {
        console.log("Ethereum provider not found");
        toast({
          title: "Wallet Error",
          description: "No Ethereum provider found. Please install MetaMask or another compatible wallet",
          variant: "destructive",
        });
        setProcessingPayment(false);
        setIsLoading(false);
        return;
      }

      // Check if wallet is installed and request access
      const isWalletReady = await checkWalletConnection();
      if (!isWalletReady) {
        setProcessingPayment(false);
        setIsLoading(false);
        return;
      }
      
      // For BNB, we need to switch to BSC network
      if (paymentMethod === 0) {
        // Check and switch to BSC network if needed
        const isNetworkReady = await switchToBscNetwork();
        if (!isNetworkReady) {
          setProcessingPayment(false);
          setIsLoading(false);
          return;
        }
      }

      // Process payment using the utility function
      await processCapsulePayment(paymentMethod, (success, txHash) => {
        setProcessingPayment(false);
        if (!success) {
          setIsLoading(false);
        }
        onClick(success, txHash);
      });
      
    } catch (error: any) {
      console.error("Payment process error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "An error occurred processing the payment",
        variant: "destructive",
      });
      onClick(false);
      setProcessingPayment(false);
      setIsLoading(false);
    }
  };

  // Combined loading state from props and local state
  const buttonIsLoading = isLoading || processingPayment;

  return (
    <Button
      className="w-full bg-gradient-to-r from-neon-blue to-neon-pink text-white hover:opacity-90 transition-opacity"
      onClick={handlePayment}
      disabled={buttonIsLoading}
      type="button"
    >
      {buttonIsLoading ? (
        <span className="flex items-center">
          <span className="animate-spin mr-2">⟳</span> PROCESSING PAYMENT...
        </span>
      ) : (
        <span className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" /> PAY {paymentAmount} AND CREATE CAPSULE
        </span>
      )}
    </Button>
  );
};

export default CreateCapsuleButton;
