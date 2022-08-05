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
  Input,
  Select,
} from '@chakra-ui/react';
import { ComptrollerErrorCodes, NativePricedFuseAsset } from '@midas-capital/sdk';
import { utils } from 'ethers';
import { ChangeEvent, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';

import { COLLATERAL_FACTOR } from '@constants/constants';
import { useSDK } from '@context/SDKContext';
import { useCTokenData } from '@hooks/useCTokenData';
import { usePoolData } from '@hooks/usePoolData';
import { usePoolsData } from '@hooks/usePoolsData';
import { useErrorToast, useSuccessToast } from '@hooks/useToast';
import { handleGenericError } from '@utils/errorHandling';

export const SetCollateralFactor = () => {
  const { sdk } = useSDK();
  const [assetIndex, setAssetIndex] = useState<number>(0);
  const [selectedAsset, setSelectedAsset] = useState<NativePricedFuseAsset | undefined>();
  const [poolId, setPoolId] = useState<string>('');
  const [collateralFactor, setCollateralFactor] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const { data: allPools } = usePoolsData();
  const { data: poolData, isLoading: isPoolDataLoading } = usePoolData(poolId);
  const cTokenData = useCTokenData(poolData?.comptroller, selectedAsset?.cToken);
  const errorToast = useErrorToast();
  const successToast = useSuccessToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setPoolId('');
  }, [allPools]);

  useEffect(() => {
    if (cTokenData) {
      setCollateralFactor(utils.formatUnits(cTokenData.collateralFactorMantissa, 16));
    } else {
      setCollateralFactor('');
    }
  }, [cTokenData]);

  useEffect(() => {
    if (poolData && poolData.assets.length !== 0) {
      setSelectedAsset(poolData.assets[assetIndex]);
    } else {
      setSelectedAsset(undefined);
    }
  }, [poolData, assetIndex]);

  const onPoolChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPoolId(e.target.value);
  };

  const onAssetChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setAssetIndex(Number(e.target.value));
  };

  const onChangeCollateralFactor = (e: ChangeEvent<HTMLInputElement>) => {
    setCollateralFactor(e.target.value);
  };

  const onSetCollateralFactor = async () => {
    if (poolId && poolData && selectedAsset) {
      setIsUpdating(true);
      const comptroller = sdk.createComptroller(poolData.comptroller);

      // 70% -> 0.7 * 1e18
      const bigCollateralFactor = utils.parseUnits((Number(collateralFactor) / 100).toString());
      try {
        const response = await comptroller.callStatic._setCollateralFactor(
          selectedAsset.cToken,
          bigCollateralFactor
        );

        if (!response.eq(0)) {
          const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);
          throw err;
        }

        const tx = await comptroller._setCollateralFactor(
          selectedAsset.cToken,
          bigCollateralFactor
        );
        await tx.wait();

        await queryClient.refetchQueries();

        successToast({ description: 'Successfully set!' });
      } catch (e) {
        handleGenericError(e, errorToast);
      } finally {
        setIsUpdating(false);
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
                Set Collateral Factor
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex direction="column" gap={4}>
              <Flex width="100%" direction="row" gap={4}>
                <FormControl flex={2}>
                  <FormLabel>Pool ID</FormLabel>
                  <Select onChange={onPoolChange} value={poolId}>
                    <option className="white-bg-option" value="">
                      Select Pool Id
                    </option>
                    {allPools &&
                      allPools.length !== 0 &&
                      allPools.map((pool, index) => {
                        return (
                          <option key={index} className="white-bg-option" value={pool?.id}>
                            {pool?.id} ( {pool?.name} )
                          </option>
                        );
                      })}
                  </Select>
                </FormControl>
                {poolId && (
                  <>
                    <FormControl flex={2}>
                      <FormLabel>Select asset {isPoolDataLoading && '( Loading )'}</FormLabel>
                      <Select onChange={onAssetChange}>
                        {poolData &&
                          poolData.assets.map((asset, index) => {
                            return (
                              <option key={index} value={index}>
                                {asset.underlyingSymbol} - {asset.underlyingName}
                              </option>
                            );
                          })}
                      </Select>
                    </FormControl>
                    {cTokenData && (
                      <FormControl flex={4}>
                        <FormLabel>
                          Input collateral factor (
                          {cTokenData.collateralFactorMantissa &&
                            `Currently set as ${utils.formatUnits(
                              cTokenData.collateralFactorMantissa,
                              16
                            )}, `}
                          should be a number between {COLLATERAL_FACTOR.MIN} and{' '}
                          {COLLATERAL_FACTOR.MAX})
                        </FormLabel>
                        <Input
                          type="number"
                          onChange={onChangeCollateralFactor}
                          value={collateralFactor}
                        />
                      </FormControl>
                    )}
                  </>
                )}
              </Flex>

              <Button
                ml="auto"
                width="100px"
                colorScheme="teal"
                onClick={onSetCollateralFactor}
                isLoading={isUpdating}
                isDisabled={
                  isUpdating ||
                  !selectedAsset ||
                  !poolId ||
                  !collateralFactor ||
                  Number(collateralFactor) < COLLATERAL_FACTOR.MIN ||
                  Number(collateralFactor) > COLLATERAL_FACTOR.MAX ||
                  (cTokenData &&
                    Number(collateralFactor) ===
                      Number(utils.formatUnits(cTokenData.collateralFactorMantissa, 16)))
                }
              >
                Set
              </Button>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
