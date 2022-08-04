import { Flex, Heading } from '@chakra-ui/react';
import { NextPage } from 'next';
import Head from 'next/head';

import { AddAsset } from '@components/sdk/AddAsset';
import { Borrow } from '@components/sdk/Borrow';
import { CreatePool } from '@components/sdk/CreatePool';
import PoolsList from '@components/sdk/PoolsList';
import { RenounceOwnership } from '@components/sdk/RenounceOwnership';
import { Repay } from '@components/sdk/Repay';
import { SetCollateral } from '@components/sdk/SetCollateral';
import { SetPoolLiquidationIncentive } from '@components/sdk/SetLiquidationIncentive';
import { SetPoolCloseFactor } from '@components/sdk/SetPoolCloseFactor';
import { SetPoolName } from '@components/sdk/SetPoolName';
import { Supply } from '@components/sdk/Supply';
import { TransferOwnership } from '@components/sdk/TransferOwndership';
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
        <Heading size="md" mt="8" mb="4">
          All pools & TVL
        </Heading>
        <PoolsList />
        <Tvllocked />

        <Heading size="md" mt="8" mb="4">
          Pool Creation
        </Heading>
        <CreatePool />

        <Heading size="md" mt="8" mb="4">
          Asset Addition
        </Heading>
        <AddAsset />

        <Heading size="md" mt="8" mb="4">
          Funding Operations
        </Heading>
        <SetCollateral />
        <Supply />
        <Borrow />
        <Withdraw />
        <Repay />

        <Heading size="md" mt="8" mb="4">
          Pool Configuration
        </Heading>
        <SetPoolName />
        <TransferOwnership />
        <RenounceOwnership />
        <SetPoolCloseFactor />
        <SetPoolLiquidationIncentive />
      </Flex>
    </>
  );
};

export default IndexPage;
