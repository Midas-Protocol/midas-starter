This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Setting up local environment

Make sure you're using the latest midas-sdk in this repo, by running

```text
>>> yarn install
```

## Getting Started

First, run the development server:

```bash
yarn dev
```

## UI

UI is only available in Chapel.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Deploy on Vercel

Coming soon

## **SDK Usage**

### **SDK Provider**

Refer to https://docs.midascapital.xyz/developers/midas-sdk for Midas SDK Installation

    import { MidasSdk } from '@midas-capital/sdk';

    export const SDKProvider = ({
    children,
    currentChain,
    chains,
    signerProvider,
    address,
    disconnect,
    }: SDKProviderProps) => {
    const sdk = useMemo(() => {
        return new MidasSdk(signerProvider as Web3Provider, chainIdToConfig[currentChain.id]);
    }, [signerProvider, currentChain.id]);


    export function useSDK() {
    const context = useContext(SDKContext);

    if (context === undefined) {
        throw new Error(`useSDK must be used within a SDKProvider`);
    }

    return context;
    }

### **All Pools**

#### Pools List (Get All Pools On Current Chain)

    import { useSDK } from '@context/SDKContext';
    const { sdk, address, currentChain } = useSDK();

    //returns all pools on Midas & Relevant Data
    const poolsData = await sdk.fetchPoolsManual({
        options: {
          from: address,
        },
      })

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
    //Adds an asset to a pool both defined under marketConfig
    await sdk.deployAsset(marketConfig, { from: address });

### **Asset Configuration**

#### Borrowing Possibility

    import { useSDK } from '@context/SDKContext';

    // This is Comptroller address, i.e., a Pool's Address
    const comptrollerAddress = "0x3r3u20ur3290..."
    const comptroller = sdk.createComptroller(comptroller.Address);

    //This variable indicates whether borrowing is to be paused or not;
    const paused = true || false;
    //This is the Asset's cToken Address
    const cTokenAddress = "0x657..."
    //Sets borrowing possibility of Asset, either resumes or pauses borrowing;
    const tx = await comptroller._setBorrowPaused(
          cTokenAddress,
          paused
        );
    await tx.wait();

#### Removing Asset

    import { useSDK } from '@context/SDKContext';

    const { sdk } = useSDK();

    //This is the Asset's cToken Address
    const cTokenAddress = "0x657..."

    //This Removes the Asset from The Pool
    const tx = await comptroller._unsupportMarket(cTokenAddress);
    await tx.wait();

#### Set Admin Fee

    import { utils } from 'ethers';
    import { useSDK } from '@context/SDKContext';
    const { sdk } = useSDK();

    //adminFee should be a number between 0 - 30
    const bigAdminFee = utils.parseUnits((Number(adminFee) / 100).toString());
    //
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
    // This is Comptroller address, i.e., a Pool's Address
    const comptrollerAddress = "0x3r3u20ur3290..."
    const comptroller = sdk.createComptroller(poolData.comptroller);

    //Sets Pool Collateral Factor
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

    //This is the Asset's cToken Address
    const cTokenAddress = "0x657...";
    //
    const cToken = sdk.createCToken(cTokenAddress);

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

    //This is the Asset's cToken Address
    const cTokenAddress = "0x657..."
    //
    const cToken = sdk.createCToken(cTokenAddress);

    //reserveFactor to be a number between 0 - 50;
    const bigreserveFactor = utils.parseUnits((Number(reserveFactor) / 100).toString());

    //Sets Asset's Reserve Factor in the corresponding Pool
    const tx = await cToken._setReserveFactor(bigreserveFactor);
    await tx.wait();

### **Flywheels**

#### Add Existing Flywheel

    import { useSDK } from '@context/SDKContext';
    const { sdk, address } = useSDK();

    //This is the Comptroller address, i.e., a Pool's Address
    const comptrollerAddress = "0x3r3u20ur3290..."
    const comptroller = sdk.createComptroller(comptrollerAddress);

    //adds rewardToken (address) to pool
    const tx = await comptroller.functions._addRewardsDistributor(rewardToken, { from: address });
    await tx.wait()

#### Deploy New Flywheel

    import { providers } from 'ethers';
    import { FlywheelStaticRewards } from '@midas-capital/sdk/dist/cjs/lib/contracts/typechain/FlywheelStaticRewards';
    import { FuseFlywheelCore } from '@midas-capital/sdk/dist/cjs/lib/contracts/typechain/FuseFlywheelCore';
    import { useSDK } from '@context/SDKContext';

    const { sdk, address } = useSDK();

    //Deploys Flywheel Core
    let fwCore: FuseFlywheelCore;
    fwCore = await sdk.deployFlywheelCore(rewardToken, { from: address });
    await fwCore.deployTransaction.wait();

    //Sets type for FlyWheel Static Rewards;
    let fwStaticRewards: FlywheelStaticRewards;

    //Deploys Flywheel Rewards
    fwStaticRewards = await sdk.deployFlywheelStaticRewards(fwCore.address, { from: address });
    await fwStaticRewards.deployTransaction.wait();

    let tx: providers.TransactionResponse;

    //Adds Rewards To Flywheel
    tx = await sdk.setFlywheelRewards(fwCore.address, fwStaticRewards.address, { from: address });
    await tx.wait()

    // This is Comptroller address, i.e., a Pool's Address
    const comptrollerAddress = "0x3r3u20ur3290..."

    //Adds FlyWheel To Pool
    tx = await sdk.addFlywheelCoreToComptroller(fwCore.address, comptrollerAddress, { from: address });
    await tx.wait()

#### Enable Asset For Rewards

    import { useSDK } from '@context/SDKContext';

    const { sdk, address } = useSDK();

    //This is the Asset's cToken Address
    const cTokenAddress = "0x657..."

    //enables asset for reward
    const tx = await sdk.addMarketForRewardsToFlywheelCore(
      flywheel.address,
      cTokenAddress,
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

    //This is the Asset's cToken Address
    const cTokenAddress = "0x657...";
    //This is the borrowing amount
    const borrowAmount = utils.parseUnits(amount, selectedAsset.underlyingDecimals);

    //Sends Request To Borrow borrowAmount of the Asset, If Borrow Is Successfull errorCode is null;
    const { tx, errorCode } = await sdk.borrow(
            cTokenAddress,
            borrowAmount,
            { from: address }
    );
    await tx.wait()

#### Repay

    import { utils } from 'ethers';
    import { useSDK } from '@context/SDKContext';
    const { sdk, address } = useSDK();

    //This is the Asset's cToken Address
    const cTokenAddress = "0x657..."

    //This is the Repay Amount as a BigNumber
    const repayAmount = utils.parseUnits(amount, selectedAsset.underlyingDecimals);

    //This is a boolean indicating if you are Repaying the max amount, i.e. the total borrowed amount
    const isRepayingMax = true || false;

    //Repays amount or returns errorCode, if repay is successfull errorCode is null;
    const { tx, errorCode } = await sdk.repay(
        cTokenAddress,
        selectedAsset.underlyingToken, //TODO WHAT IS THIS?
        isRepayingMax,
        repayAmount,
        { from: address }
    );
    await tx.wait()

#### Set Collateral

This section Covers either Adding or Removing an Asset as Collateral

    import { ContractTransaction } from 'ethers';
    import { useSDK } from '@context/SDKContext';
    const { sdk } = useSDK();

    // This is Comptroller address, i.e., a Pool's Address
    const comptrollerAddress = "0x3r3u20ur3290..."
    const comptroller = sdk.createComptroller(comptrollerAddress);

    //This is the Asset's cToken Address
    const cTokenAddress = "0x657..."

    //Sets the transaction type as a ContractTransaction
    let tx: ContractTransaction;

    //Removes Asset As Collateral To Corresponding Pool
    tx = await comptroller.exitMarket(cTokenAddress);
    await tx.wait();

    //Adds Asset(s) As Collateral To Corresponding Pool, Multiple Assets Can Be Added In The Array [cTokenAddress]
    tx = await comptroller.enterMarkets([cTokenAddress]);
    await tx.wait();

#### Supply

    import { useSDK } from '@context/SDKContext';
    const { sdk, address } = useSDK();

    //This is the Asset's cToken Address
    const cTokenAddress = "0x657..."

    // This is Comptroller address, i.e., a Pool's Address
    const comptrollerAddress = "0x3r3u20ur3290..."
    const comptroller = sdk.createComptroller(comptrollerAddress);

    //This is a Boolean Indicating Whether The Asset Is Enabled As Collateral
    const enableCollateral = true || false;

    //This is the amount as a BigNumber to be supplied
    supplyAmount = utils.parseUnits(amount, selectedAsset.underlyingDecimals)

    //This Makes The Call To Supply The Asset To Pool, errorCode is null if successful;
    const { tx, errorCode } = await sdk.supply(
        cTokenAddress,
        selectedAsset.underlyingToken, //TO DO WHAT IS THIS??
        comptrollerAddress,
        supplyAmount,
        { from: address }
    );
    await tx.wait()

#### Withdraw

    import { useSDK } from '@context/SDKContext';
    const { sdk, address } = useSDK();

    //This is the Asset's cToken Address
    const cTokenAddress = "0x657..."

    const withdrawAmount = utils.parseUnits(amount, selectedAsset.underlyingDecimals) //TODO define underlying decimals

    //Withdraws Asset From Pool To Wallet (address), errorCode is null if successful;
    const { tx, errorCode } = await sdk.withdraw(
            cTokenAddress,
            withdrawAmount,
            { from: address }
    );
    await tx.wait();

### **Pool Configuration**

#### Renounce Ownership

    import { Contract, ContractTransaction } from 'ethers';
    import { useSDK } from '@context/SDKContext';
    import { usePoolData } from '@hooks/usePoolData';
    import { usePoolsData } from '@hooks/usePoolsData';

    const { sdk, address } = useSDK();

    //This is the Asset's cToken Address
    const cTokenAddress = "0x657..."

    // This is Comptroller address, i.e., a Pool's Address
    const comptrollerAddress = "0x3r3u20ur3290..."


    //TODO Define unitroller
    const unitroller = new (
        comptrollerAddress,
        sdk.artifacts.Unitroller.abi, //TODO define this
        sdk.provider.getSigner() //TODO define this
    );

    //Renounces Ownership of Unitroller
    const tx: ContractTransaction = await unitroller._toggleAdminRights(false);

#### Set Liquidation Incentive

    import { useSDK } from '@context/SDKContext';
    import { usePoolData } from '@hooks/usePoolData';
    import { BigNumber, utils } from 'ethers';

    const { sdk, address } = useSDK();

    //liquidationIncentive should be a number between 0 - 50
    const bigLiquidationIncentive: BigNumber = utils.parseUnits(
            (Number(liquidationIncentive) / 100 + 1).toString()
    );

    // This is Comptroller address, i.e., a Pool's Address
    const comptrollerAddress = "0x3r3u20ur3290..."
    const comptroller = sdk.createComptroller(comptrollerAddress);

    //Sets Liquidation Incentive Of The Pool
    const tx = await comptroller._setLiquidationIncentive(bigLiquidationIncentive);
    await tx.wait();

#### Set Pool Close Factor

    import { useSDK } from '@context/SDKContext';
    import { usePoolData } from '@hooks/usePoolData';
    const { sdk, address } = useSDK();
    const { data: poolData } = usePoolData(poolId);

    //This is The Close Factor as a BigNumber. closeFactor should be a number between 5 - 90;
    const bigCloseFactor: BigNumber = utils.parseUnits((Number(closeFactor) / 100).toString());
    // This is Comptroller address, i.e., a Pool's Address
    const comptrollerAddress = "0x3r3u20ur3290..."
    const comptroller = sdk.createComptroller(comptrollerAddress);

    //Sets the Pool's Close Factor
    const tx: ContractTransaction = await comptroller._setCloseFactor(bigCloseFactor);
    await tx.wait();

#### Set Pool Name

    import { Contract } from 'ethers';
    import { useSDK } from '@context/SDKContext';
    const { sdk, address } = useSDK();

    //TODO DEFINE THIS
    const FusePoolDirectory = new Contract(
      sdk.chainDeployment.FusePoolDirectory.address,
      sdk.chainDeployment.FusePoolDirectory.abi,
      sdk.provider.getSigner()
    );

    //Sets or Changes Pool's Name
    const tx = await FusePoolDirectory.setPoolName(poolId, poolName, { from: address });
    await tx.wait();

#### Set Whitelist

    import { providers } from 'ethers';
    import { useSDK } from '@context/SDKContext';

    import { useExtraPoolInfo } from '@hooks/useExtraPoolInfo';

    const { sdk, address } = useSDK();

    const extraData = useExtraPoolInfo(poolData?.comptroller || '');

    // This is Comptroller address, i.e., a Pool's Address
    const comptrollerAddress = "0x3r3u20ur3290..."
    const comptroller = sdk.createComptroller(comptrollerAddress);

    let tx: providers.TransactionResponse;

    //This is a boolean that indicates if White List Enforcement is active
    const enforce = true || false;

    //This sets White List Enforcement
    tx = await comptroller._setWhitelistEnforcement(enforce);
    await tx.wait()

    const newList = [...extraData.whitelist, validAddress];

    //This is a list addresses allowed to interact with the Pool
    const whiteList = [0x304..., 0x914..., 0x452...];
    //This sets the White List Of The Pool
    tx = await comptroller._setWhitelistStatuses(
      whiteList,
      Array(whiteList.length).fill(true)
    );
    await tx.wait();

#### Transfer Ownership

    import { useSDK } from '@context/SDKContext';

    const { sdk, address } = useSDK();

    //This is the address you would like to transfer ownership of the Pool to
    const transferAddress = "0x341..."

    // This is Comptroller address, i.e., a Pool's Address
    const comptrollerAddress = "0x3r3u20ur3290..."
    const unitroller = sdk.createUnitroller(comptrollerAddress);

    //Transfers ownership of Pool to transferAddress
    const tx = await unitroller._setPendingAdmin(transferAddress);
    await tx.wait();

### **Pool Creation**

#### Create Pool

    import { utils } from 'ethers';
    import { useSDK } from '@context/SDKContext';

    const { sdk, address } = useSDK();

    //This is the name of the pool
    const poolName: string = "Example Pool"

    //closeFactor should be a number between 5 - 90
    const bigCloseFactor: BigNumber = utils.parseUnits(closeFactor.toString(), 16);

    //liquidationIncentive should be a number between 0 - 50
    const bigLiquidationIncentive: BigNumber = utils.parseUnits((liquidationIncentive + 100).toString(), 16);

    //This sets the oracle of the Pool, see https://docs.midascapital.xyz/developers/midas-sdk/api-reference-typing-and-interfaces#oracletypes for OracleTypes
    const oracle : OracleTypes = "MasterPriceOracle"

    //This is the addresses that are allowed to interact with the Pool (optional)
    const whitelistedAddresses: Array<string> = [0x321...,0x647...,0x553,...]

    //TO DO what is a reporter?
    const reporter =

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

    //TODO check this wording/trim this down
    //This grabs the newly created Pool address and creates a new "implementation" address of the pool
    const poolId = deployResult[3];
    const poolData = await sdk.fetchFusePoolData(poolId.toString(), address);
    const unitroller = sdk.createUnitroller(poolData.comptroller);

    //This sets the Admin of the newly created pool to creator's address
    const tx = await unitroller._acceptAdmin();
    await tx.wait();
