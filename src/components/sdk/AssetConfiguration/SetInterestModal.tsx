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
import { ComptrollerErrorCodes, NativePricedFuseAsset } from '@midas-capital/sdk';
import { ChangeEvent, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';

import { useSDK } from '@context/SDKContext';
import { useCTokenData } from '@hooks/useCTokenData';
import { usePoolData } from '@hooks/usePoolData';
import { usePoolsData } from '@hooks/usePoolsData';
import { useErrorToast, useSuccessToast } from '@hooks/useToast';
import { handleGenericError } from '@utils/errorHandling';

export const SetInterestModal = () => {
  const { sdk } = useSDK();
  const [assetIndex, setAssetIndex] = useState<number>(0);
  const [selectedAsset, setSelectedAsset] = useState<NativePricedFuseAsset | undefined>();
  const [poolId, setPoolId] = useState<string>('');
  const [isSetting, setIsSetting] = useState<boolean>(false);
  const { data: allPools } = usePoolsData();
  const { data: poolData, isLoading: isPoolDataLoading } = usePoolData(poolId);
  const { data: cTokenData } = useCTokenData(poolData?.comptroller, selectedAsset?.cToken);
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

  const onIrmChange = async () => {
    if (poolId && poolData && selectedAsset && cTokenData) {
      try {
        setIsSetting(true);
        const cToken = sdk.createCToken(selectedAsset.cToken);
        const irmAddress =
          cTokenData.interestRateModelAddress === sdk.chainDeployment.JumpRateModel.address
            ? sdk.chainDeployment.JumpRateModel.address
            : sdk.chainDeployment.WhitePaperInterestRateModel.address;

        const response = await cToken.callStatic._setInterestRateModel(irmAddress);

        if (!response.eq(0)) {
          const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);
          throw err;
        }

        const tx = await cToken._setInterestRateModel(irmAddress);
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
                Set Interest Rate Modal
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
                    {cTokenData && (
                      <FormControl flex={3}>
                        <FormLabel mt={10}>
                          IRM (Currently set as{' '}
                          {cTokenData.interestRateModelAddress ===
                          sdk.chainDeployment.JumpRateModel.address
                            ? 'JumpRateModel'
                            : 'WhitePaperRateModel'}{' '}
                          )
                        </FormLabel>
                      </FormControl>
                    )}
                  </>
                )}
              </Flex>

              {cTokenData && (
                <Button
                  ml="auto"
                  width="300px"
                  colorScheme="teal"
                  onClick={onIrmChange}
                  isLoading={isSetting}
                  isDisabled={isSetting || !selectedAsset}
                >
                  {cTokenData.interestRateModelAddress === sdk.chainDeployment.JumpRateModel.address
                    ? 'Change to WhitePaperRateModel'
                    : 'Change to JumpRateModel'}
                </Button>
              )}
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
