import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';

import { NETWORK_DATA } from '@constants/networkData';

// API key for Ethereum node
// Two popular services are Infura (infura.io) and Alchemy (alchemy.com)
const infuraId = process.env.INFURA_ID;

// Chains for connectors to support

type NativeCurrencyType = {
  name: string;
  symbol: string;
  decimals: 18;
};

type Chain = {
  id: number;
  name: string;
  nativeCurrency?: NativeCurrencyType | undefined;
  rpcUrls: string[];
  blockExplorers?: {
    name: string;
    url: string;
  }[];
  testnet?: boolean;
};

const chains: Chain[] = Object.values(NETWORK_DATA).map((data) => {
  return {
    id: data.chainId,
    name: data.name,
    nativeCurrency: {
      name: data.nativeCurrency.name,
      symbol: data.nativeCurrency.symbol,
      decimals: 18,
    },
    rpcUrls: data.rpcUrls,
    blockExplorers: data.blockExplorerUrls,
  };
});

export const connectors = () => {
  return [
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
    new WalletConnectConnector({
      chains,
      options: {
        infuraId,
        qrcode: true,
      },
    }),
  ];
};
