
import { ethers } from "ethers";
import { toast } from "@/hooks/use-toast";

/**
 * Sends a payment transaction
 * @param recipientAddress Address to send the payment to
 * @param amount Amount to send in BNB
 * @returns Transaction receipt if successful, null otherwise
 */
export const sendPaymentTransaction = async (
  recipientAddress: string,
  amount: string
): Promise<ethers.providers.TransactionReceipt | null> => {
  try {
    // Get the provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    console.log("Sending payment from address:", userAddress);

    // Create transaction
    const tx = {
      to: recipientAddress,
      value: ethers.utils.parseEther(amount),
      gasLimit: ethers.utils.hexlify(21000), // Standard gas limit for transfers
    };

    console.log("Preparing transaction:", tx);
    
    // Send transaction
    const transaction = await signer.sendTransaction(tx);
    console.log("Transaction sent:", transaction.hash);
    
    toast({
      title: "Transaction Sent",
      description: "Waiting for transaction confirmation...",
    });
    
    // Wait for confirmation
    const receipt = await transaction.wait();
    console.log("Transaction confirmed:", receipt);

    if (receipt.status === 1) {
      toast({
        title: "Payment Successful",
        description: `Your payment of ${amount} BNB has been processed`,
      });
      return receipt;
    } else {
      toast({
        title: "Payment Error",
        description: "Transaction was not successful",
        variant: "destructive",
      });
      return null;
    }
  } catch (error: any) {
    console.error("Transaction error:", error);
    toast({
      title: "Transaction Error",
      description: error.message || "An error occurred processing the transaction",
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Handles the capsule creation transaction process
 * @param recipientAddress Address to send the payment to
 * @param amount Amount to send in BNB
 * @param onSuccess Callback function to execute on successful payment
 * @returns boolean indicating success or failure
 */
export const handleCapsuleCreationTransaction = async (
  recipientAddress: string,
  amount: string,
  onSuccess: () => void
): Promise<boolean> => {
  try {
    // Send payment transaction
    const receipt = await sendPaymentTransaction(recipientAddress, amount);
    
    // If payment was successful, call the success callback
    if (receipt) {
      console.log("Payment successful, creating capsule...");
      onSuccess();
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.error("Capsule creation transaction error:", error);
    toast({
      title: "Capsule Creation Error",
      description: error.message || "An error occurred processing the capsule creation",
      variant: "destructive",
    });
    return false;
  }
};
