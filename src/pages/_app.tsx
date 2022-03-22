import '@styles/index.css';
import { ChakraProvider } from '@chakra-ui/react';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import Layout from '@components/shared/Layout';
import { theme } from '@constants/theme';
import { RariProvider } from '@context/RariContext';

const AuthMiddleware = dynamic(() => import('@components/Auth'), {
  ssr: false,
});

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <RariProvider>
          <Layout>
            <AuthMiddleware />
            <Component {...pageProps} />
          </Layout>
        </RariProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default appWithTranslation(MyApp);
