import { Divider, VStack } from '@chakra-ui/react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { AccountDisplay } from '@components/AccountDisplay';
import { NetworkSelect } from '@components/NetworkSelect';
import { PoolAssets } from '@components/PoolAssets';

const DynamicConnectorSelect = dynamic(() => import('@components/ConnectorSelect'), {
  ssr: false,
});

const IndexPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Midas Starter</title>
      </Head>
      <VStack align={'flex-start'} gap={8}>
        <DynamicConnectorSelect />
        <Divider />

        <AccountDisplay />
        <Divider />

        <NetworkSelect />
        <Divider />

        <PoolAssets />
      </VStack>
    </>
  );
};

export default IndexPage;
