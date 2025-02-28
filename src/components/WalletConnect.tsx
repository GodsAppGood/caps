
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

  // Обработка подключения/отключения кошелька
  const handleWalletAction = () => {
    if (isConnected) {
      disconnect();
      toast({
        title: 'Кошелек отключен',
        description: 'Ваш кошелек был успешно отключен',
      });
    } else {
      // Открыть модальное окно Web3Modal
      const injected = connectors.find((c) => c.id === 'injected');
      if (injected?.ready) {
        connect({ connector: injected });
      } else {
        // Открываем Web3Modal через глобальный метод
        const w3mEvent = new Event('w3m-open-modal');
        document.dispatchEvent(w3mEvent);
      }
    }
  };

  // Сокращение адреса для отображения
  const shortenAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Не рендерим на стороне сервера
  if (!mounted) return null;

  return (
    <button
      onClick={handleWalletAction}
      className="flex items-center gap-2 px-6 py-3 rounded-full bg-space-light border border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-white transition-all duration-300"
    >
      <Wallet className="w-5 h-5" />
      {isConnected ? `${shortenAddress(address)}` : "CONNECT WALLET"}
    </button>
  );
};
