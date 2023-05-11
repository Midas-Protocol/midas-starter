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
  Select,
} from '@chakra-ui/react';
import { NativePricedFuseAsset } from '@midas-capital/types';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';

import { useSDK } from '@context/SDKContext';
import { Flywheel, useFlywheelsForPool } from '@hooks/useFlywheelsForPool';
import { usePoolData } from '@hooks/usePoolData';
import { usePoolsData } from '@hooks/usePoolsData';
import { useErrorToast, useSuccessToast } from '@hooks/useToast';
import { handleGenericError } from '@utils/errorHandling';

export const EnableAssetForRewards = () => {
  const { sdk, address } = useSDK();

  const [assetIndex, setAssetIndex] = useState<number>(0);
  const [selectedAsset, setSelectedAsset] = useState<NativePricedFuseAsset | undefined>();
  const [poolId, setPoolId] = useState<string>('');
  const [isEnabling, setIsEnabling] = useState(false);
  const [flywheelId, setFlywheelId] = useState<string>('0');
  const [flywheel, setFlywheel] = useState<Flywheel | undefined>();

  const { data: allPools } = usePoolsData();
  const { data: poolData, isLoading: isPoolDataLoading } = usePoolData(poolId);
  const { data: flywheels } = useFlywheelsForPool(poolData?.comptroller);

  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const availablePools = useMemo(() => {
    return allPools?.filter((pool) => pool?.creator === address);
  }, [allPools, address]);

  useEffect(() => {
    if (flywheels && flywheelId) {
      setFlywheel(flywheels[Number(flywheelId)]);
    } else {
      setFlywheel(undefined);
    }
  }, [flywheelId, flywheels]);

  useEffect(() => {
    setPoolId('');
  }, [allPools]);

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

  const onFlywheelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFlywheelId(e.target.value);
  };

  const enableForRewards = async () => {
    console.log(selectedAsset, flywheel);
    if (selectedAsset && flywheel) {
      try {
        setIsEnabling(true);
        const tx = await sdk.addMarketForRewardsToFlywheelCore(
          flywheel.address,
          selectedAsset.cToken
        );
        await tx.wait();
        successToast({ description: 'Successfully enabled!' });
        setIsEnabling(false);
      } catch (err) {
        handleGenericError(err, errorToast);
      } finally {
        setIsEnabling(false);
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
                Fund Flywheel
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
                    {availablePools &&
                      availablePools.length !== 0 &&
                      availablePools.map((pool, index) => {
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
                    <FormControl flex={3}>
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
                  </>
                )}
                {allPools && poolId && (
                  <FormControl flex={3}>
                    <FormLabel>Flywheels</FormLabel>
                    <Select onChange={onFlywheelChange} value={flywheelId}>
                      {flywheels &&
                        flywheels.length !== 0 &&
                        flywheels.map((fw, index) => {
                          return (
                            <option key={index} className="white-bg-option" value={index}>
                              {fw.address}
                            </option>
                          );
                        })}
                    </Select>
                  </FormControl>
                )}
              </Flex>

              <Button
                ml="auto"
                width="100px"
                colorScheme="teal"
                onClick={enableForRewards}
                isLoading={isEnabling}
                isDisabled={isEnabling || !poolId || !flywheel}
              >
                Enable
              </Button>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
