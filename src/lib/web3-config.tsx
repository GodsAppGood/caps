
import { configureChains, createConfig } from 'wagmi';
import { mainnet, bsc, bscTestnet } from 'wagmi/chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { FC } from 'react';

// Add your project ID from WalletConnect Cloud (this is required)
const projectId = '3bffda126f23d0bd2c76873bf75106d5';

// Configure supported chains (adding BSC Testnet for development)
const chains = [mainnet, bsc, bscTestnet];
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

// Wagmi configuration
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});

// Create Ethereum client for Web3Modal
export const ethereumClient = new EthereumClient(wagmiConfig, chains);

// Web3Modal component - Now properly typed as a React functional component
export const Web3ModalComponent: FC = () => {
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
