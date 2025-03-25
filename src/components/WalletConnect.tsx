
import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { TwitterLoginButton } from './TwitterLoginButton';

export const WalletConnect = () => {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const { user, signOut } = useAuth();

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

  // Handle Twitter logout
  const handleTwitterLogout = async () => {
    await signOut();
  };

  // Shorten address for display
  const shortenAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Don't render on server-side
  if (!mounted) return null;

  // If user is logged in with Twitter, show profile button
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={handleTwitterLogout}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-space-light border border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-white transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          DISCONNECT
        </button>
        {!isConnected && (
          <button
            onClick={handleWalletAction}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-space-light border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-white transition-all duration-300"
          >
            <Wallet className="w-5 h-5" />
            CONNECT WALLET
          </button>
        )}
        {isConnected && (
          <button
            onClick={handleWalletAction}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-space-light border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-white transition-all duration-300"
          >
            <Wallet className="w-5 h-5" />
            {shortenAddress(address)}
          </button>
        )}
      </div>
    );
  }

  // If user is not logged in, show Twitter login and wallet connect buttons
  return (
    <div className="flex items-center gap-3">
      <TwitterLoginButton />
      {!isConnected ? (
        <button
          onClick={handleWalletAction}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-space-light border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-white transition-all duration-300"
        >
          <Wallet className="w-5 h-5" />
          CONNECT WALLET
        </button>
      ) : (
        <button
          onClick={handleWalletAction}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-space-light border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-white transition-all duration-300"
        >
          <Wallet className="w-5 h-5" />
          {shortenAddress(address)}
        </button>
      )}
    </div>
  );
};
