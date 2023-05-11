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
  Text,
} from '@chakra-ui/react';
import { NativePricedFuseAsset } from '@midas-capital/types';
import { ContractTransaction } from 'ethers';
import { ChangeEvent, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';

import { useSDK } from '@context/SDKContext';
import { usePoolData } from '@hooks/usePoolData';
import { usePoolsData } from '@hooks/usePoolsData';
import { useErrorToast, useInfoToast, useSuccessToast } from '@hooks/useToast';
import { errorCodeToMessage, handleGenericError } from '@utils/errorHandling';

export const SetCollateral = () => {
  const { sdk } = useSDK();
  const [assetIndex, setAssetIndex] = useState<number>(0);
  const [selectedAsset, setSelectedAsset] = useState<NativePricedFuseAsset | undefined>();
  const [poolId, setPoolId] = useState<string>('');
  const [isSetting, setIsSetting] = useState<boolean>(false);
  const { data: allPools } = usePoolsData();
  const { data: poolData, isLoading: isPoolDataLoading } = usePoolData(poolId);
  const errorToast = useErrorToast();
  const infoToast = useInfoToast();
  const successToast = useSuccessToast();
  const queryClient = useQueryClient();

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

  const onCollateral = async () => {
    if (poolData?.comptroller && selectedAsset) {
      setIsSetting(true);
      try {
        const comptroller = sdk.createComptroller(poolData.comptroller, sdk.signer);

        let tx: ContractTransaction;
        if (selectedAsset.membership) {
          const exitCode = await comptroller.callStatic.exitMarket(selectedAsset.cToken);
          if (!exitCode.eq(0)) {
            infoToast({
              title: 'Cannot Remove Collateral',
              description: errorCodeToMessage(exitCode.toNumber()),
            });
            return;
          }
          tx = await comptroller.exitMarket(selectedAsset.cToken);
        } else {
          tx = await comptroller.enterMarkets([selectedAsset.cToken]);
        }

        if (!tx) {
          if (selectedAsset.membership) {
            errorToast({
              title: 'Error! Code: ' + tx,
              description:
                'You cannot disable this asset as collateral as you would not have enough collateral posted to keep your borrow. Try adding more collateral of another type or paying back some of your debt.',
            });
          } else {
            errorToast({
              title: 'Error! Code: ' + tx,
              description: 'You cannot enable this asset as collateral at this time.',
            });
          }

          return;
        }

        await tx.wait();
        await queryClient.refetchQueries();

        successToast({ description: 'Successfully set!' });
      } catch (e) {
        handleGenericError(e, errorToast);
      } finally {
        setIsSetting(false);
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
                Set Collateral
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
              </Flex>
              {selectedAsset && (
                <Flex>
                  <Text>
                    {selectedAsset.membership
                      ? 'This asset is being used as collateral.'
                      : 'This asset is not being used as collateral'}
                  </Text>
                </Flex>
              )}

              <Button
                ml="auto"
                width="100px"
                colorScheme="teal"
                onClick={onCollateral}
                isLoading={isSetting}
                isDisabled={isSetting || !selectedAsset}
              >
                {selectedAsset?.membership ? 'Disable' : 'Enable'}
              </Button>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
