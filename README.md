This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Setting up local environment

Requirements: local hardhat node, up-to-date midas-sdk. For this, follow the steps 2 and 3 in
the [contracts repository](https://github.com/Midas-Protocol/contracts#dev-workflow)

If you want to run locally, you need to make sure to set SDK version as below

```text
.....
@midas-capital/sdk:  "file:../contracts"
.....
```

After that, make sure you're using the latest midas-sdk in this repo, by running

```text
>>> npm install
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

## Connecting Metamask

Also make sure to have the hardhat node running, as described in the [contracts repository](https://github.com/Midas-Protocol/contracts#dev-workflow)

To connect with metamask, run the hardhat node with:

```text
>>> npx hardhat node --show-accounts
```

Pick the third account (named "bob"), and use the private key shown to import a new account to MetaMask. You can
then connect your browser to the local hardhat node by adding `localhost:8485`, `chainId 1337` to your
MetaMask networks.

## UI

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Deploy on Vercel

Coming soon


## **SDK Usage**


### **All Pools**

#### Pools List (Get All Pools On Current Chain)

import { usePoolsData } from '@hooks/usePoolsData';

//returns all pools on Midas & Relevant Data
const { data: allPools } = usePoolsData()

#### Tvl Locked
	import { useSDK } from '@context/SDKContext';
  import { BigNumber, utils } from 'ethers';

  //returns TVL in Big Number format
	const tvlNative = await useSDK().sdk.getTotalValueLocked(false)

  //returns TVL in ETH value
  utils.formatUnits(tvlNative)


### **Asset Addition**

#### Add Asset To Existing Pools (That You Own)

    import { MarketConfig } from '@midas-capital/sdk';
    import { usePoolData } from '@hooks/usePoolData';

    const { data: poolData } = usePoolData(poolId);

//TODO NOTE THE MARKETCONFIG TYPE IS NOT DOCUMENTED ANYWHERE ELSE

    const marketConfig: MarketConfig = {
            underlying: selectedAsset.underlying,
            comptroller: poolData.comptroller,
            adminFee: adminFee,
            collateralFactor: collateralFactor,
            interestRateModel: irm,
            reserveFactor: reserveFactor,
            plugin: undefined,
            bypassPriceFeedCheck: true,
            fuseFeeDistributor: sdk.chainDeployment.FuseFeeDistributor.address,
            symbol: 'f' + selectedAsset.symbol + '-' + poolId,
            name: poolData.name + ' ' + selectedAsset.name,
        };

    await sdk.deployAsset(marketConfig, { from: address });


### **Asset Configuration**

#### Borrowing Possibility

    import { useSDK } from '@context/SDKContext';
    import { usePoolData } from '@hooks/usePoolData';

    const { data: poolData } = usePoolData(poolId);

    //returns a boolean whether asset borrowing has been paused
    const isBorrowingPaused = poolData.assets(assetId).isBorrowPaused

    const comptroller = sdk.createComptroller(poolData.comptroller);

    //sets borrowing paused based on boolean paused
    const tx = await comptroller._setBorrowPaused(
          selectedAsset.cToken,
          paused
        );
    await tx.wait();


#### Removing Asset
    import { useSDK } from '@context/SDKContext';

    const { sdk } = useSDK();
    const { data: poolData } = usePoolData(poolId);

    //removes asset from pool
    const tx = await comptroller._unsupportMarket(selectedAsset.cToken);
    await tx.wait();



#### Set Admin Fee
    import { utils } from 'ethers';
    import { useSDK } from '@context/SDKContext';
    const { sdk } = useSDK();

    //adminFee should be a number between 0 - 30
    const bigAdminFee = utils.parseUnits((Number(adminFee) / 100).toString());
    const cToken = sdk.createCToken(selectedAsset.cToken);

    //sets admin fee
    const tx = await cToken._setAdminFee(bigAdminFee);
    await tx.wait();

#### Set Collateral Factor
    import { utils } from 'ethers';
    import { useSDK } from '@context/SDKContext';
    const { sdk } = useSDK();

    //collateralFactor should be a number between 5 - 90
    const bigCollateralFactor = utils.parseUnits((Number(collateralFactor) / 100).toString());
    const comptroller = sdk.createComptroller(poolData.comptroller);

    //sets collateral factor
    const tx = await comptroller._setCollateralFactor(
          selectedAsset.cToken,
          bigCollateralFactor
        );
    await tx.wait();

#### Set Interest Rate Model

    import { useSDK } from '@context/SDKContext';
    import { useCTokenData } from '@hooks/useCTokenData';
    const { sdk } = useSDK();
    const { data: cTokenData } = useCTokenData(poolData?.comptroller, selectedAsset?.cToken);

    const cToken = sdk.createCToken(selectedAsset.cToken);

    //TODO SHOULD I SPECIFY IRMADDRESS? to my knowledge we currently only Jump Rate Model & White Paper Model
    const irmAddress =
        cTokenData.interestRateModelAddress === sdk.chainDeployment.JumpRateModel.address
        ? sdk.chainDeployment.JumpRateModel.address
        : sdk.chainDeployment.WhitePaperInterestRateModel.address;

    //sets interest rate model
    const tx = await cToken._setInterestRateModel(irmAddress);
    await tx.wait();

#### Set Reserve Factor

    const { sdk } = useSDK();
    const { data: cTokenData } = useCTokenData(poolData?.comptroller, selectedAsset?.cToken);
    const cToken = sdk.createCToken(selectedAsset.cToken);

    //reserve factor to be a number between 0 - 50;
    const bigreserveFactor = utils.parseUnits((Number(reserveFactor) / 100).toString());

    //sets reserve factor
    const tx = await cToken._setReserveFactor(bigreserveFactor);
    await tx.wait();

### **Flywheels**

#### Add Existing Flywheel

    import { useSDK } from '@context/SDKContext';
    const { sdk, address } = useSDK();
    import { usePoolData } from '@hooks/usePoolData';

    const { data: poolData } = usePoolData(poolId);
    const comptroller = sdk.createComptroller(poolData.comptroller);

    //adds rewardToken (address) to pool
    const tx = await comptroller.functions._addRewardsDistributor(rewardToken, { from: address });
    await tx.wait()

#### Deploy New Flywheel

    import { providers } from 'ethers';
    import { FlywheelStaticRewards } from '@midas-capital/sdk/dist/cjs/lib/contracts/typechain/FlywheelStaticRewards';
    import { FuseFlywheelCore } from '@midas-capital/sdk/dist/cjs/lib/contracts/typechain/FuseFlywheelCore';
    import { useSDK } from '@context/SDKContext';

    const { sdk, address } = useSDK();

    //deploys flywheel core
    let fwCore: FuseFlywheelCore;
    fwCore = await sdk.deployFlywheelCore(rewardToken, { from: address });
    await fwCore.deployTransaction.wait();

    let fwStaticRewards: FlywheelStaticRewards;

    //deploys flywheel rewards
    fwStaticRewards = await sdk.deployFlywheelStaticRewards(fwCore.address, { from: address });
    await fwStaticRewards.deployTransaction.wait();

    let tx: providers.TransactionResponse;

    //adds rewards to flywheel
    tx = await sdk.setFlywheelRewards(fwCore.address, fwStaticRewards.address, { from: address });
    await tx.wait()

    //adds flywheel to pool
    tx = await sdk.addFlywheelCoreToComptroller(fwCore.address, poolData.comptroller, { from: address });
    await tx.wait()


#### Enable Asset For Rewards

    import { useSDK } from '@context/SDKContext';

    const { sdk, address } = useSDK();

    //enables asset for reward
    const tx = await sdk.addMarketForRewardsToFlywheelCore(
      flywheel.address,
      selectedAsset.cToken,
      {
        from: address,
      }
    );
    await tx.wait();

#### Fund Flywheel

    import { Contract, utils } from 'ethers';
    import { useSDK } from '@context/SDKContext';

    const { sdk, address } = useSDK();
    const token = new Contract(
            flywheel.rewardToken,
            sdk.artifacts.EIP20Interface.abi,
            sdk.provider.getSigner()
          );
    // TODO use rewardsTokens decimals here *ALEX'S TODO*****

    const tx = await token.transfer(
      flywheel.rewards,
      utils.parseUnits(fundingAmount.toString())
    );
    await tx.wait();

### **Funding Operations**

#### Borrow

    import { utils } from 'ethers';
    import { useSDK } from '@context/SDKContext';

    const { sdk, address } = useSDK();

    //borrows amount or returns errorCode; if borrow is successfull errorCode is null
    const { tx, errorCode } = await sdk.borrow(
            selectedAsset.cToken,
            utils.parseUnits(amount, selectedAsset.underlyingDecimals),
            { from: address }
    );
    await tx.wait()
#### Repay

    import { utils } from 'ethers';
    import { useSDK } from '@context/SDKContext';
    const { sdk, address } = useSDK();

    const bigAmount = utils.parseUnits(amount, selectedAsset.underlyingDecimals);

    //repays amount or returns errorCode, if repay is successfull errorCode is null;
    const { tx, errorCode } = await sdk.repay(
        selectedAsset.cToken,
        selectedAsset.underlyingToken,
        isRepayingMax,
        bigAmount,
        { from: address }
    );
    await tx.wait()

#### Set Collateral

    import { ContractTransaction } from 'ethers';
    import { useSDK } from '@context/SDKContext';
    const { sdk } = useSDK();

    const comptroller = sdk.createComptroller(poolData.comptroller);

    let tx: ContractTransaction;

    //remove asset as collateral to pool
    tx = await comptroller.exitMarket(selectedAsset.cToken);
    await tx.wait();

    //add asset(s) as collateral to pool
    tx = await comptroller.enterMarkets([selectedAsset.cToken]);
    await tx.wait();

#### Supply

    import { useSDK } from '@context/SDKContext';
    const { sdk, address } = useSDK();

    //supplies amount to pool, errorCode is null if successful;
    const { tx, errorCode } = await sdk.supply(
        selectedAsset.cToken,
        selectedAsset.underlyingToken,
        poolData.comptroller,
        enableCollateral === 'true',
        utils.parseUnits(amount, selectedAsset.underlyingDecimals),
        { from: address }
    );
    await tx.wait()

#### Withdraw

    import { useSDK } from '@context/SDKContext';
    const { sdk, address } = useSDK();

    //withdraws asset to wallet, errorCode is null if successful;
    const { tx, errorCode } = await sdk.withdraw(
            selectedAsset.cToken,
            utils.parseUnits(amount, selectedAsset.underlyingDecimals),
            { from: address }
    );
    await tx.wait()

### **Pool Configuration**

#### Renounce Ownership

    import { Contract, ContractTransaction } from 'ethers';
    import { useSDK } from '@context/SDKContext';
    import { usePoolData } from '@hooks/usePoolData';
    import { usePoolsData } from '@hooks/usePoolsData';

    const { sdk, address } = useSDK();
    const { data: poolData } = usePoolData(poolId);

    const unitroller = new (
        poolData.comptroller,
        sdk.artifacts.Unitroller.abi,
        sdk.provider.getSigner()
    );

    //renounces ownership
    const tx: ContractTransaction = await unitroller._toggleAdminRights(false);


#### Set Liquidation Incentive

    import { useSDK } from '@context/SDKContext';
    import { usePoolData } from '@hooks/usePoolData';
    import { BigNumber, utils } from 'ethers';

    const { sdk, address } = useSDK();
    const { data: poolData } = usePoolData(poolId);

    //liquidationIncentive should be a number between 0 - 50
    const bigLiquidationIncentive: BigNumber = utils.parseUnits(
            (Number(liquidationIncentive) / 100 + 1).toString()
    );

    const comptroller = sdk.createComptroller(poolData.comptroller);

    //sets liquidation incentive
    const tx = await comptroller._setLiquidationIncentive(bigLiquidationIncentive);
    await tx.wait();

#### Set Pool Close Factor

    import { useSDK } from '@context/SDKContext';
    import { usePoolData } from '@hooks/usePoolData';
    const { sdk, address } = useSDK();
    const { data: poolData } = usePoolData(poolId);

    //closeFactor should be a number between 5 - 90;
    const bigCloseFactor: BigNumber = utils.parseUnits((Number(closeFactor) / 100).toString());
    const comptroller = sdk.createComptroller(poolData.comptroller);

    //sets pool close factor
    const tx: ContractTransaction = await comptroller._setCloseFactor(bigCloseFactor);
    await tx.wait();

#### Set Pool Name

    import { Contract } from 'ethers';
    import { useSDK } from '@context/SDKContext';
    const { sdk, address } = useSDK();
    const FusePoolDirectory = new Contract(
      sdk.chainDeployment.FusePoolDirectory.address,
      sdk.chainDeployment.FusePoolDirectory.abi,
      sdk.provider.getSigner()
    );

    //sets pool name to poolName
    const tx = await FusePoolDirectory.setPoolName(poolId, poolName, { from: address });
    await tx.wait();

#### Set Whitelist

    import { providers } from 'ethers';
    import { useSDK } from '@context/SDKContext';
    import { usePoolData } from '@hooks/usePoolData';
    import { useExtraPoolInfo } from '@hooks/useExtraPoolInfo';

    const { sdk, address } = useSDK();
    const { data: poolData } = usePoolData(poolId);
    const extraData = useExtraPoolInfo(poolData?.comptroller || '');
    const comptroller = sdk.createComptroller(poolData.comptroller);

    let tx: providers.TransactionResponse;

    //sets whitelist enforcement, enforce to be a boolean
    tx = await comptroller._setWhitelistEnforcement(enforce);
    await tx.wait()

    const newList = [...extraData.whitelist, validAddress];

    //sets whitelist to newList
    tx = await comptroller._setWhitelistStatuses(
      newList,
      Array(newList.length).fill(true)
    );
    await tx.wait();

#### Transfer Ownership
    import { useSDK } from '@context/SDKContext';
    import { usePoolData } from '@hooks/usePoolData';

    const { sdk, address } = useSDK();
    const { data: poolData } = usePoolData(poolId);
    const verifiedAddress = utils.getAddress(transferAddress.toLowerCase());
    const unitroller = sdk.createUnitroller(poolData.comptroller);

    //transfers ownership to verifiedAddress
    const tx = await unitroller._setPendingAdmin(verifiedAddress);
    await tx.wait();

### **Pool Creation**
#### Create Pool

    import { utils } from 'ethers';
    import { useSDK } from '@context/SDKContext';

    const { sdk, address } = useSDK();

    //closeFactor should be a number between 5 - 90;
    const bigCloseFactor = utils.parseUnits(closeFactor.toString(), 16);
    //liquidationIncentive should be a number between 0 - 50
    const bigLiquidationIncentive = utils.parseUnits((liquidationIncentive + 100).toString(), 16);

    const deployResult = await sdk.deployPool(
        poolName,
        whitelistedAddresses.length !== 0,
        bigCloseFactor,
        bigLiquidationIncentive,
        oracle,
        { reporter },
        { from: address },
        whitelistedAddresses
      );

    const poolId = deployResult[3];
    const poolData = await sdk.fetchFusePoolData(poolId.toString(), address);
    const unitroller = sdk.createUnitroller(poolData.comptroller);
    const tx = await unitroller._acceptAdmin();
    await tx.wait();
