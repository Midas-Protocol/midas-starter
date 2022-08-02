import { Flex, Heading } from '@chakra-ui/react';
import { NextPage } from 'next';
import Head from 'next/head';

import { AddAsset } from '@components/sdk/AddAsset';
import { Borrow } from '@components/sdk/Borrow';
import { CreatePool } from '@components/sdk/CreatePool';
import PoolsList from '@components/sdk/PoolsList';
import { Supply } from '@components/sdk/Supply';
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
        <CreatePool />
        <AddAsset />
        <Supply />
        <Borrow />
      </Flex>
    </>
  );
};

export default IndexPage;
