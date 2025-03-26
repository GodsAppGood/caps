
import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { checkWalletConnection, switchToBscNetwork, openWalletModal } from "@/utils/walletUtils";
import { sendPaymentTransaction } from "@/utils/transactionUtils";

interface CreateCapsuleButtonProps {
  isLoading: boolean;
  onClick: () => void;
  paymentAmount: string;
}

const RECIPIENT_ADDRESS = "0x0AbD5b7B6DE3ceA8702dAB2827D31CDA46c6e750";

const CreateCapsuleButton = ({ isLoading, onClick, paymentAmount }: CreateCapsuleButtonProps) => {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();

  const handlePayment = async () => {
    console.log("Payment button clicked");
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
        return;
      }

      // Check if wallet is installed and request access
      const isWalletReady = await checkWalletConnection();
      if (!isWalletReady) {
        return;
      }
      
      // Check and switch to BSC network if needed
      const isNetworkReady = await switchToBscNetwork();
      if (!isNetworkReady) {
        return;
      }

      // Send payment transaction
      const receipt = await sendPaymentTransaction(RECIPIENT_ADDRESS, "0.01");
      
      // If payment was successful, proceed with capsule creation
      if (receipt) {
        console.log("Payment successful, creating capsule...");
        onClick();
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "An error occurred processing the payment",
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
          <CreditCard className="mr-2 h-5 w-5" /> PAY {paymentAmount} AND CREATE CAPSULE
        </span>
      )}
    </Button>
  );
};

export default CreateCapsuleButton;
