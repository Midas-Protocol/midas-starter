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

export const Supply = () => {
  const { sdk, address } = useSDK();
  const [assetIndex, setAssetIndex] = useState<number>(0);
  const [selectedAsset, setSelectedAsset] = useState<NativePricedFuseAsset | undefined>();
  const [poolId, setPoolId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [enableCollateral, setEnableCollateral] = useState<string>('true');
  const [isSupplying, setIsSupplying] = useState<boolean>(false);
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

  const onEnableCollateral = (e: ChangeEvent<HTMLSelectElement>) => {
    setEnableCollateral(e.target.value);
  };

  const onChangeAmount = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const onSupply = async () => {
    if (selectedAsset && poolData?.comptroller) {
      setIsSupplying(true);
      try {
        const token = sdk.getEIP20TokenInstance(selectedAsset.underlyingToken, sdk.signer);
        const hasApprovedEnough = (
          await token.callStatic.allowance(address, selectedAsset.cToken)
        ).gte(utils.parseUnits(amount, selectedAsset.underlyingDecimals));

        if (!hasApprovedEnough) {
          const tx = await sdk.approve(selectedAsset.cToken, selectedAsset.underlyingToken);
          await tx.wait();
          successToast({
            description: 'Successfully Approved!',
            id: 'Approved - ' + Math.random().toString(),
          });
        }

        if (enableCollateral) {
          const tx = await sdk.enterMarkets(selectedAsset.cToken, poolData.comptroller);
          await tx.wait();

          successToast({
            description: 'Collateral enabled!',
            id: 'Collateral enabled - ' + Math.random().toString(),
          });
        }

        const { tx, errorCode } = await sdk.mint(
          selectedAsset.cToken,
          utils.parseUnits(amount, selectedAsset.underlyingDecimals)
        );

        if (errorCode !== null) {
          fundOperationError(errorCode);
        } else {
          await tx.wait();
          await queryClient.refetchQueries();
          successToast({ description: 'Successfully supplied!' });
        }
      } catch (e) {
        handleGenericError(e, errorToast);
      } finally {
        setIsSupplying(false);
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
                Supply asset
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
                    <FormControl flex={1}>
                      <FormLabel>Enable collateral</FormLabel>
                      <Select onChange={onEnableCollateral} value={enableCollateral}>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
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
                onClick={onSupply}
                isLoading={isSupplying}
                isDisabled={isSupplying || !selectedAsset}
              >
                Supply
              </Button>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
