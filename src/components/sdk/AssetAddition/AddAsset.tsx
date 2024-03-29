import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
} from '@chakra-ui/react';
import { MarketConfig, SupportedAsset } from '@midas-capital/types';
import { constants } from 'ethers';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';

import { ADMIN_FEE, COLLATERAL_FACTOR, RESERVE_FACTOR } from '@constants/constants';
import { useSDK } from '@context/SDKContext';
import { usePoolData } from '@hooks/usePoolData';
import { usePoolsData } from '@hooks/usePoolsData';
import { useErrorToast, useSuccessToast } from '@hooks/useToast';
import { handleGenericError } from '@utils/errorHandling';

export const AddAsset = () => {
  const { sdk, address } = useSDK();
  const [assetIndex, setAssetIndex] = useState<number>(0);
  const [selectedAsset, setSelectedAsset] = useState<SupportedAsset | undefined>();
  const [poolId, setPoolId] = useState<string>('');
  const [availableAssets, setAvailableAssets] = useState<SupportedAsset[] | []>([]);
  const [collateralFactor, setCollateralFactor] = useState<number>(COLLATERAL_FACTOR.DEFAULT);
  const [reserveFactor, setReserveFactor] = useState<number>(RESERVE_FACTOR.DEFAULT);
  const [adminFee, setAdminFee] = useState<number>(ADMIN_FEE.DEFAULT);
  const [addedAssetsAddress, setAddedAssetsAddress] = useState<string[] | undefined>();
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [irm, setIrm] = useState<string>(sdk.chainDeployment.JumpRateModel.address);
  const { data: allPools } = usePoolsData();
  const { data: poolData, isLoading: isPoolDataLoading } = usePoolData(poolId);
  const errorToast = useErrorToast();
  const successToast = useSuccessToast();
  const queryClient = useQueryClient();
  const pools = useMemo(() => {
    return allPools?.filter((pool) => pool?.creator.toLowerCase() === address.toLowerCase());
  }, [allPools, address]);

  useEffect(() => {
    setPoolId('');
  }, [pools]);

  useEffect(() => {
    if (poolData && poolData.assets.length !== 0) {
      const addresses = poolData.assets.map((asset) => asset.underlyingToken.toLowerCase());
      setAddedAssetsAddress(addresses);
    } else {
      setAddedAssetsAddress(undefined);
    }
  }, [poolData]);

  useEffect(() => {
    if (availableAssets.length !== 0) {
      setSelectedAsset(availableAssets[assetIndex]);
    } else {
      setSelectedAsset(undefined);
    }
  }, [assetIndex, availableAssets]);

  useEffect(() => {
    if (poolData && !isPoolDataLoading && poolId) {
      const availableAssets = sdk.supportedAssets.filter(
        (asset) => !addedAssetsAddress?.includes(asset.underlying.toLowerCase())
      );

      setAvailableAssets(availableAssets);
    } else {
      setAvailableAssets([]);
    }
  }, [sdk.supportedAssets, addedAssetsAddress, isPoolDataLoading, poolData, poolId]);

  const onPoolChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPoolId(e.target.value);
  };

  const onAssetChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setAssetIndex(Number(e.target.value));
  };

  const onCollateralFactor = (value: string) => {
    setCollateralFactor(Number(value));
  };

  const onReserveFactor = (value: string) => {
    setReserveFactor(Number(value));
  };

  const onAdminFee = (value: string) => {
    setAdminFee(Number(value));
  };

  const onIrmChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setIrm(e.target.value);
  };

  const onAddAsset = async () => {
    if (selectedAsset && poolData?.comptroller) {
      setIsAdding(true);
      try {
        const masterPriceOracle = sdk.createMasterPriceOracle();
        const res = await masterPriceOracle.callStatic.oracles(selectedAsset.underlying);
        if (res === constants.AddressZero) {
          errorToast({
            description:
              'This asset is not supported. The price oracle is not available for this asset',
          });
          setIsAdding(false);
          return;
        }
      } catch (e) {
        console.error(e);
        setIsAdding(false);
        return;
      }

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

      try {
        await sdk.deployAsset(marketConfig);

        await queryClient.refetchQueries();

        successToast({
          title: 'You have successfully added an asset to this pool!',
          description: 'You may now lend and borrow with this asset.',
        });
      } catch (e) {
        handleGenericError(e, errorToast);
      } finally {
        setIsAdding(false);
      }
    }
  };

  return (
    <Box width="100%">
      <Accordion allowToggle>
        <AccordionItem borderWidth={1} borderColor="teal">
          <h2>
            <AccordionButton _expanded={{ bg: 'teal', color: 'white' }}>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Adding an asset to a pool
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex direction="column" gap={4}>
              <Heading size="md">You can add an asset to a pool only you created</Heading>
              <Flex width="100%" direction="row" gap={4}>
                <FormControl flex={1}>
                  <FormLabel>Pool ID</FormLabel>
                  <Select onChange={onPoolChange} value={poolId}>
                    <option className="white-bg-option" value="">
                      Select Pool Id
                    </option>
                    {pools &&
                      pools.length !== 0 &&
                      pools.map((pool, index) => {
                        return (
                          <option key={index} className="white-bg-option" value={pool?.id}>
                            {pool?.id} ( {pool?.name} )
                          </option>
                        );
                      })}
                  </Select>
                </FormControl>
                {poolId && (
                  <FormControl flex={3}>
                    <FormLabel>Available Assets {isPoolDataLoading && '( Loading )'}</FormLabel>
                    <Select onChange={onAssetChange}>
                      {availableAssets.map((asset, index) => {
                        return (
                          <option key={index} value={index}>
                            {asset.symbol} - {asset.name}
                          </option>
                        );
                      })}
                    </Select>
                  </FormControl>
                )}
              </Flex>
              {poolId && selectedAsset && (
                <Flex width="100%" direction="row" gap={4}>
                  <FormControl flex={2}>
                    <FormLabel>Collateral Factor</FormLabel>
                    <NumberInput
                      defaultValue={COLLATERAL_FACTOR.DEFAULT}
                      min={COLLATERAL_FACTOR.MIN}
                      max={COLLATERAL_FACTOR.MAX}
                      value={collateralFactor}
                      keepWithinRange={false}
                      clampValueOnBlur={false}
                      onChange={onCollateralFactor}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl flex={2}>
                    <FormLabel>Reserve Factor</FormLabel>
                    <NumberInput
                      defaultValue={RESERVE_FACTOR.DEFAULT}
                      min={RESERVE_FACTOR.MIN}
                      max={RESERVE_FACTOR.MAX}
                      value={reserveFactor}
                      keepWithinRange={false}
                      clampValueOnBlur={false}
                      onChange={onReserveFactor}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl flex={2}>
                    <FormLabel>Admin Fee</FormLabel>
                    <NumberInput
                      defaultValue={ADMIN_FEE.DEFAULT}
                      min={ADMIN_FEE.MIN}
                      max={ADMIN_FEE.MAX}
                      value={adminFee}
                      keepWithinRange={false}
                      clampValueOnBlur={false}
                      onChange={onAdminFee}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl flex={3}>
                    <FormLabel>Interest Rate Model</FormLabel>
                    <Select onChange={onIrmChange}>
                      <option value={sdk.chainDeployment.JumpRateModel.address}>
                        JumpRateModel
                      </option>
                      <option value={sdk.chainDeployment.WhitePaperInterestRateModel.address}>
                        WhitePaperRateModel
                      </option>
                    </Select>
                  </FormControl>
                </Flex>
              )}

              <Button
                ml="auto"
                width="100px"
                colorScheme="teal"
                onClick={onAddAsset}
                isLoading={isAdding}
                isDisabled={isAdding || !selectedAsset}
              >
                Add asset
              </Button>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
