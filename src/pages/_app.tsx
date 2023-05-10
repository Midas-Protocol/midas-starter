import '@styles/index.css';

import { ChakraProvider } from '@chakra-ui/react';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { createConfig, WagmiConfig } from 'wagmi';

import Layout from '@components/page/Layout';
import CheckConnection from '@components/shared/CheckConnection';
import { connectors, publicClient } from '@utils/connectors';

const queryClient = new QueryClient();

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <WagmiConfig config={config}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <Layout>
            <CheckConnection>
              <Component {...pageProps} />
            </CheckConnection>
          </Layout>
        </QueryClientProvider>
      </WagmiConfig>
    </ChakraProvider>
  );
}

export default MyApp;
