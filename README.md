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


## SDK Usage


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
    /*TODO SHOULD I REMOVE THESE?
    import { usePoolData } from '@hooks/usePoolData';

    const { data: poolData /*,  isLoading: isPoolDataLoading */} = usePoolData(poolId);*/

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

    import { usePoolData } from '@hooks/usePoolData';

    const { data: poolData, isLoading: isPoolDataLoading } = usePoolData(poolId);

    //Returns A Boolean Whether Asset Borrowing Has Been Paused
    const isBorrowingPaused = poolData.assets(assetId).isBorrowPaused


#### Removing Asset
    import { useSDK } from '@context/SDKContext';

    const { sdk } = useSDK();

    const { data: poolData } = usePoolData(poolId);

    //removes asset from pool
    const tx = await comptroller._unsupportMarket(selectedAsset.cToken);



#### Set Admin Fee
    import { utils } from 'ethers';
    import { useSDK } from '@context/SDKContext';
    const { sdk } = useSDK();

    //adminFee should be a number between 0 - 30
    const bigAdminFee = utils.parseUnits((Number(adminFee) / 100).toString());
    const cToken = sdk.createCToken(selectedAsset.cToken);

    //sets admin fee
    const tx = await cToken._setAdminFee(bigAdminFee);

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

#### Set Reserve Factor

    const { sdk } = useSDK();
    const { data: cTokenData } = useCTokenData(poolData?.comptroller, selectedAsset?.cToken);
    const cToken = sdk.createCToken(selectedAsset.cToken);

    //reserve factor to be a number between 0 - 50;
    const bigreserveFactor = utils.parseUnits((Number(reserveFactor) / 100).toString());

    //sets reserve factor
    const tx = await cToken._setReserveFactor(bigreserveFactor);

### **Flywheels**

#### Add Existing Flywheel
#### Deploy New Flywheel
#### Enable Asset For Rewards
#### Fund Flywheel

### **Funding Operations**

#### Borrow
#### Repay
#### Set Collateral
#### Supply
#### Withdraw

### **Pool Configuration**
#### Renounce Ownership
#### Set Liquidation Incentive
#### Set Pool Close Factor
#### Set Pool Name
#### Set Whitelist
#### Transfer Ownership

### **Pool Creation**
#### Create Pool
    import { useSDK } from '@context/SDKContext';

    const { sdk, address } = useSDK();

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
