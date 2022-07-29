import { Flex, Heading } from '@chakra-ui/react';
import { NextPage } from 'next';
import Head from 'next/head';

import { PoolAssets } from '@components/sdk/PoolAssets';
import PoolsList from '@components/sdk/PoolsList';
import { useSDK } from '@context/SDKContext';

const IndexPage: NextPage = () => {
  const { currentChain } = useSDK();

  return (
    <>
      <Head>
        <title>Midas Starter</title>
      </Head>
      <Flex width="100%" direction="column" gap={0}>
        {currentChain && (
          <Heading mb={4}>
            Connected to {currentChain.name} {currentChain?.unsupported && '(unsupported)'}
          </Heading>
        )}
        <PoolsList />
        <PoolAssets />
      </Flex>
    </>
  );
};

export default IndexPage;
