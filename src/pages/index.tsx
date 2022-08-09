import { Flex, Heading } from '@chakra-ui/react';
import { NextPage } from 'next';
import Head from 'next/head';

import { AddAsset } from '@components/sdk/AddAsset';
import { AddExistingFlywheel } from '@components/sdk/AddExistingFlywheel';
import { Borrow } from '@components/sdk/Borrow';
import { BorrowingPossibility } from '@components/sdk/BorrowingPossibility';
import { CreatePool } from '@components/sdk/CreatePool';
import { DeployNewFlywheel } from '@components/sdk/DeployNewFlywheel';
import PoolsList from '@components/sdk/PoolsList';
import { RemovingAsset } from '@components/sdk/RemovingAsset';
import { RenounceOwnership } from '@components/sdk/RenounceOwnership';
import { Repay } from '@components/sdk/Repay';
import { SetAdminFee } from '@components/sdk/SetAdminFee';
import { SetCollateral } from '@components/sdk/SetCollateral';
import { SetCollateralFactor } from '@components/sdk/SetCollateralFactor';
import { SetInterestModal } from '@components/sdk/SetInterestModal';
import { SetPoolLiquidationIncentive } from '@components/sdk/SetLiquidationIncentive';
import { SetPoolCloseFactor } from '@components/sdk/SetPoolCloseFactor';
import { SetPoolName } from '@components/sdk/SetPoolName';
import { SetReserveFactor } from '@components/sdk/SetReserveFactor';
import { SetWhitelist } from '@components/sdk/SetWhitelist';
import { Supply } from '@components/sdk/Supply';
import { TransferOwnership } from '@components/sdk/TransferOwndership';
import { Tvllocked } from '@components/sdk/Tvllocked';
import { Withdraw } from '@components/sdk/Withdraw';
import { useSDK } from '@context/SDKContext';

export async function getInitialProps() {
  return {};
}

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
        <SetWhitelist />

        <Heading size="md" mt="8" mb="4">
          Asset Configuration
        </Heading>
        <BorrowingPossibility />
        <SetCollateralFactor />
        <SetReserveFactor />
        <SetAdminFee />
        <SetInterestModal />
        <RemovingAsset />

        <Heading size="md" mt="8" mb="4">
          Flywheels
        </Heading>
        <DeployNewFlywheel />
        <AddExistingFlywheel />
      </Flex>
    </>
  );
};

export default IndexPage;
