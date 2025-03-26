
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { checkWalletConnection, switchToBscNetwork, openWalletModal } from "@/utils/walletUtils";
import { handleCapsuleCreationTransaction } from "@/utils/transactionUtils";

interface CreateCapsuleButtonProps {
  isLoading: boolean;
  onClick: () => void;
  paymentAmount: string;
}

const RECIPIENT_ADDRESS = "0x0AbD5b7B6DE3ceA8702dAB2827D31CDA46c6e750";

const CreateCapsuleButton = ({ isLoading, onClick, paymentAmount }: CreateCapsuleButtonProps) => {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const [processingPayment, setProcessingPayment] = useState(false);

  const handlePayment = async () => {
    console.log("Payment button clicked");
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
        return;
      }

      // Check if wallet is installed and request access
      const isWalletReady = await checkWalletConnection();
      if (!isWalletReady) {
        setProcessingPayment(false);
        return;
      }
      
      // Check and switch to BSC network if needed
      const isNetworkReady = await switchToBscNetwork();
      if (!isNetworkReady) {
        setProcessingPayment(false);
        return;
      }

      // Process payment and create capsule on success
      await handleCapsuleCreationTransaction(RECIPIENT_ADDRESS, "0.01", onClick);
      
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "An error occurred processing the payment",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
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
