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
import { NativePricedFuseAsset } from '@midas-capital/types';
import { utils } from 'ethers';
import { ChangeEvent, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';

import { useSDK } from '@context/SDKContext';
import { usePoolData } from '@hooks/usePoolData';
import { usePoolsData } from '@hooks/usePoolsData';
import { useErrorToast, useSuccessToast } from '@hooks/useToast';
import { handleGenericError } from '@utils/errorHandling';
import { fundOperationError } from '@utils/fundOperationError';

export const Repay = () => {
  const { sdk } = useSDK();
  const [assetIndex, setAssetIndex] = useState<number>(0);
  const [selectedAsset, setSelectedAsset] = useState<NativePricedFuseAsset | undefined>();
  const [poolId, setPoolId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isRepaying, setIsRepaying] = useState<boolean>(false);
  const { data: allPools } = usePoolsData();
  const { data: poolData, isLoading: isPoolDataLoading } = usePoolData(poolId);
  const errorToast = useErrorToast();
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

  const onChangeAmount = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const onRepay = async () => {
    if (selectedAsset) {
      setIsRepaying(true);
      const bigAmount = utils.parseUnits(amount, selectedAsset.underlyingDecimals);
      const isRepayingMax = bigAmount.eq(selectedAsset.borrowBalance);
      try {
        const { tx, errorCode } = await sdk.repay(selectedAsset.cToken, isRepayingMax, bigAmount);

        if (errorCode !== null) {
          fundOperationError(errorCode);
        } else {
          await tx.wait();
          await queryClient.refetchQueries();
          successToast({ description: 'Successfully repaied!' });
        }
      } catch (e) {
        handleGenericError(e, errorToast);
      } finally {
        setIsRepaying(false);
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
                Repay asset
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
                    <FormControl flex={3}>
                      <FormLabel>
                        Amount ({' '}
                        {selectedAsset ? selectedAsset.underlyingSymbol : 'No Asset selected'} )
                      </FormLabel>
                      <Input type="number" onChange={onChangeAmount} value={amount} />
                    </FormControl>
                  </>
                )}
              </Flex>

              <Button
                ml="auto"
                width="100px"
                colorScheme="teal"
                onClick={onRepay}
                isLoading={isRepaying}
                isDisabled={isRepaying || !selectedAsset}
              >
                Repay
              </Button>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
