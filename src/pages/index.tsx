import { Flex, Heading } from '@chakra-ui/react';
import { NextPage } from 'next';
import Head from 'next/head';

import PoolsList from '@components/sdk/AllPools/PoolsList';
import { Tvllocked } from '@components/sdk/AllPools/Tvllocked';
import { AddAsset } from '@components/sdk/AssetAddition/AddAsset';
import { BorrowingPossibility } from '@components/sdk/AssetConfiguration/BorrowingPossibility';
import { RemovingAsset } from '@components/sdk/AssetConfiguration/RemovingAsset';
import { SetAdminFee } from '@components/sdk/AssetConfiguration/SetAdminFee';
import { SetCollateralFactor } from '@components/sdk/AssetConfiguration/SetCollateralFactor';
import { SetInterestModal } from '@components/sdk/AssetConfiguration/SetInterestModal';
import { SetReserveFactor } from '@components/sdk/AssetConfiguration/SetReserveFactor';
import { AddExistingFlywheel } from '@components/sdk/Flywheels/AddExistingFlywheel';
import { EnableAssetForRewards } from '@components/sdk/Flywheels/EnableAssetForRewards';
import { FundFlywheel } from '@components/sdk/Flywheels/FundFlywheel';
import { Borrow } from '@components/sdk/FundingOperations/Borrow';
import { Repay } from '@components/sdk/FundingOperations/Repay';
import { SetCollateral } from '@components/sdk/FundingOperations/SetCollateral';
import { Supply } from '@components/sdk/FundingOperations/Supply';
import { Withdraw } from '@components/sdk/FundingOperations/Withdraw';
import { RenounceOwnership } from '@components/sdk/PoolConfiguration/RenounceOwnership';
import { SetPoolLiquidationIncentive } from '@components/sdk/PoolConfiguration/SetLiquidationIncentive';
import { SetPoolCloseFactor } from '@components/sdk/PoolConfiguration/SetPoolCloseFactor';
import { SetPoolName } from '@components/sdk/PoolConfiguration/SetPoolName';
import { SetWhitelist } from '@components/sdk/PoolConfiguration/SetWhitelist';
import { TransferOwnership } from '@components/sdk/PoolConfiguration/TransferOwndership';
import { CreatePool } from '@components/sdk/PoolCreation/CreatePool';
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
        <AddExistingFlywheel />
        <FundFlywheel />
        <EnableAssetForRewards />
      </Flex>
    </>
  );
};

export default IndexPage;
