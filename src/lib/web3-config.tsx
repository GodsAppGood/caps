
import { configureChains, createConfig } from 'wagmi';
import { mainnet, bsc } from 'wagmi/chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';

// Replace with your real Project ID from WalletConnect Cloud
const projectId = 'YOUR_PROJECT_ID';

// Configure supported chains
const chains = [mainnet, bsc];
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

// Wagmi configuration
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});

// Create Ethereum client for Web3Modal
export const ethereumClient = new EthereumClient(wagmiConfig, chains);

// Web3Modal component
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
