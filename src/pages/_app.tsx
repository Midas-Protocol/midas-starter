import { ChakraProvider } from '@chakra-ui/react';
import '@styles/index.css';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Chain, defaultChains, Provider as WagmiProvider } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

import { SDKContext, SDKProvider } from '../context/SDKContext';

const bscTestnet: Chain = {
  id: 97,
  name: 'BSC Testnet (Chapel)',
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  nativeCurrency: {
    symbol: 'TBNB',
    name: 'BSC',
    decimals: 18,
  },
  testnet: true,
};

// Chains for connectors to support
const chains = [...defaultChains, bscTestnet];

// Set up connectors
const connectors = () => {
  return [
    new InjectedConnector({
      chains: chains,
      options: { shimDisconnect: true },
    }),
  ];
};
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <WagmiProvider autoConnect connectors={connectors}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <SDKProvider>
            <Component {...pageProps} />
          </SDKProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ChakraProvider>
  );
}

export default MyApp;
