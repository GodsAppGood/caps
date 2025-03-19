
import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const WalletConnect = () => {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle wallet connection/disconnection
  const handleWalletAction = () => {
    if (isConnected) {
      disconnect();
      toast({
        title: 'Wallet disconnected',
        description: 'Your wallet has been successfully disconnected',
      });
    } else {
      // Open Web3Modal
      const injected = connectors.find((c) => c.id === 'injected');
      if (injected?.ready) {
        connect({ connector: injected });
      } else {
        // Open Web3Modal using global method
        const w3mEvent = new Event('w3m-open-modal');
        document.dispatchEvent(w3mEvent);
      }
    }
  };

  // Shorten address for display
  const shortenAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Don't render on server-side
  if (!mounted) return null;

  return (
    <button
      onClick={handleWalletAction}
      className="glowing-btn px-10 py-4 text-xl"
    >
      <Wallet className="w-5 h-5 mr-2 inline-block" />
      {isConnected ? `${shortenAddress(address)}` : "WALLET"}
    </button>
  );
};
