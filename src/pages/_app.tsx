import '@styles/index.css';

import { ChakraProvider } from '@chakra-ui/react';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { createClient, WagmiConfig } from 'wagmi';

import Layout from '@components/page/Layout';
import CheckConnection from '@components/shared/CheckConnection';
import { connectors, provider } from '@utils/connectors';

const queryClient = new QueryClient();

const client = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <WagmiConfig client={client}>
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
