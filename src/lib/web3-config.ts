
import { configureChains, createConfig } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';

// Замените на ваш реальный Project ID из WalletConnect Cloud
const projectId = 'YOUR_PROJECT_ID';

// Настройка поддерживаемых цепей
const chains = [mainnet, polygon];
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

// Конфигурация Wagmi
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});

// Создание клиента Ethereum для Web3Modal
export const ethereumClient = new EthereumClient(wagmiConfig, chains);

// Компонент модального окна Web3Modal
export const Web3ModalComponent = () => {
  return (
    <Web3Modal
      projectId={projectId}
      ethereumClient={ethereumClient}
      themeMode="dark"
      themeVariables={{
        '--w3m-font-family': 'Roboto, sans-serif',
        '--w3m-accent-color': '#00F5FF',
        '--w3m-background-color': '#1E0B38',
      }}
    />
  );
};
