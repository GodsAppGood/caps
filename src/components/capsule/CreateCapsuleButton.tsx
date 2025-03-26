
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
          title: "Кошелек не найден",
          description: "Пожалуйста, установите MetaMask или другой Ethereum кошелек",
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
              console.error("Error adding BSC network:", addError);
              toast({
                title: "Ошибка сети",
                description: "Не удалось добавить сеть BSC в ваш кошелек",
                variant: "destructive",
              });
              return;
            }
          } else {
            console.error("Error switching to BSC network:", switchError);
            toast({
              title: "Ошибка сети",
              description: "Пожалуйста, переключитесь на сеть Binance Smart Chain",
              variant: "destructive",
            });
            return;
          }
        }
      }

      // Get the signer after potentially switching networks
      const updatedProvider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = updatedProvider.getSigner();
      
      // Get user address for confirmation
      const userAddress = await signer.getAddress();
      console.log("Sending payment from address:", userAddress);

      // Create transaction parameters
      const tx = {
        to: RECIPIENT_ADDRESS,
        value: ethers.utils.parseEther("0.01"), // Always 0.01 BNB
      };

      console.log("Preparing transaction:", tx);

      // Send the transaction
      const transaction = await signer.sendTransaction(tx);
      console.log("Transaction sent:", transaction.hash);
      
      // Show pending toast
      toast({
        title: "Транзакция отправлена",
        description: "Ожидание подтверждения транзакции...",
      });
      
      // Wait for transaction to be mined
      const receipt = await transaction.wait();
      console.log("Transaction receipt:", receipt);

      // If transaction was successful, proceed with onClick (create capsule)
      if (receipt.status === 1) {
        toast({
          title: "Платеж успешен",
          description: "Ваш платеж в размере 0.01 BNB был успешно обработан",
        });
        console.log("Payment successful, creating capsule...");
        onClick();
      } else {
        toast({
          title: "Платеж не удался",
          description: "Транзакция не была успешной",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Платеж не удался",
        description: error.message || "Произошла ошибка при обработке вашего платежа",
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
          <span className="animate-spin mr-2">⟳</span> ОБРАБОТКА ПЛАТЕЖА...
        </span>
      ) : (
        <span className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" /> ОПЛАТИТЬ 0.01 BNB И СОЗДАТЬ КАПСУЛУ
        </span>
      )}
    </Button>
  );
};

export default CreateCapsuleButton;
