import '@styles/index.css';
import { ChakraProvider } from '@chakra-ui/react';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Provider as WagmiProvider } from 'wagmi';

import Layout from '@components/shared/Layout';
import { theme } from '@constants/theme';
import { RariProvider } from '@context/RariContext';
import { connectors } from '@utils/connectors';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <WagmiProvider autoConnect connectors={connectors}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <RariProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </RariProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ChakraProvider>
  );
}

export default appWithTranslation(MyApp);
