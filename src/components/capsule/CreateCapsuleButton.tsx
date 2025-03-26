
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, CreditCard } from "lucide-react";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";

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
          title: "Кошелек не подключен",
          description: "Пожалуйста, подключите кошелек для оплаты",
          variant: "destructive",
        });
        
        // Trigger wallet connection via Web3Modal
        const w3mEvent = new Event('w3m-open-modal');
        document.dispatchEvent(w3mEvent);
        return;
      }

      // Check if MetaMask or other wallet is installed
      if (typeof window.ethereum === "undefined") {
        console.log("Wallet not detected");
        toast({
          title: "Кошелек не обнаружен",
          description: "Пожалуйста, установите MetaMask или другой совместимый кошелек",
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

      try {
        // Ensure we have permission to the account
        console.log("Requesting account access");
        await window.ethereum.request({ method: "eth_requestAccounts" });
        
        // Get the signer with fresh provider after potential network switch
        const updatedProvider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = updatedProvider.getSigner();
        const userAddress = await signer.getAddress();
        console.log("Sending payment from address:", userAddress);

        // Create transaction
        const tx = {
          to: RECIPIENT_ADDRESS,
          value: ethers.utils.parseEther("0.01"), // Always 0.01 BNB
          gasLimit: ethers.utils.hexlify(21000), // Standard gas limit for transfers
        };

        console.log("Preparing transaction:", tx);
        
        // Send transaction
        const transaction = await signer.sendTransaction(tx);
        console.log("Transaction sent:", transaction.hash);
        
        toast({
          title: "Транзакция отправлена",
          description: "Ожидание подтверждения транзакции...",
        });
        
        // Wait for confirmation
        const receipt = await transaction.wait();
        console.log("Transaction confirmed:", receipt);

        if (receipt.status === 1) {
          toast({
            title: "Оплата успешна",
            description: "Ваш платеж в размере 0.01 BNB успешно обработан",
          });
          
          // Proceed with capsule creation
          console.log("Payment successful, creating capsule...");
          onClick();
        } else {
          toast({
            title: "Ошибка оплаты",
            description: "Транзакция не была успешной",
            variant: "destructive",
          });
        }
      } catch (txError: any) {
        console.error("Transaction error:", txError);
        toast({
          title: "Ошибка транзакции",
          description: txError.message || "Произошла ошибка при обработке транзакции",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Ошибка оплаты",
        description: error.message || "Произошла ошибка при обработке платежа",
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
          <span className="animate-spin mr-2">⟳</span> ОБРАБОТКА ПЛАТЕЖА...
        </span>
      ) : (
        <span className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" /> ОПЛАТИТЬ {paymentAmount} И СОЗДАТЬ КАПСУЛУ
        </span>
      )}
    </Button>
  );
};

export default CreateCapsuleButton;
