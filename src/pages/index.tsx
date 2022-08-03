import { Flex, Heading } from '@chakra-ui/react';
import { NextPage } from 'next';
import Head from 'next/head';

import { AddAsset } from '@components/sdk/AddAsset';
import { Borrow } from '@components/sdk/Borrow';
import { CreatePool } from '@components/sdk/CreatePool';
import PoolsList from '@components/sdk/PoolsList';
import { Repay } from '@components/sdk/Repay';
import { SetCollateral } from '@components/sdk/SetCollateral';
import { SetPoolName } from '@components/sdk/SetPoolName';
import { Supply } from '@components/sdk/Supply';
import { Tvllocked } from '@components/sdk/Tvllocked';
import { Withdraw } from '@components/sdk/Withdraw';
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
        <Tvllocked />
        <CreatePool />
        <AddAsset />
        <Supply />
        <Borrow />
        <Withdraw />
        <Repay />
        <SetCollateral />
        <SetPoolName />
      </Flex>
    </>
  );
};

export default IndexPage;
