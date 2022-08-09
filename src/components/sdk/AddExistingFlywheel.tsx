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
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { useSDK } from '@context/SDKContext';
import { usePoolData } from '@hooks/usePoolData';
import { usePoolsData } from '@hooks/usePoolsData';
import { useErrorToast, useSuccessToast } from '@hooks/useToast';
import { handleGenericError } from '@utils/errorHandling';

export const AddExistingFlywheel = () => {
  const { sdk, address } = useSDK();

  const [rewardToken, setRewardToken] = useState<string>('');
  const [poolId, setPoolId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  const { data: allPools } = usePoolsData();
  const { data: poolData } = usePoolData(poolId);

  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const availablePools = useMemo(() => {
    return allPools?.filter((pool) => pool?.creator === address);
  }, [allPools, address]);

  useEffect(() => {
    setPoolId('');
  }, [allPools]);

  const onPoolChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPoolId(e.target.value);
  };

  const onChangeRewardToken = (e: ChangeEvent<HTMLInputElement>) => {
    setRewardToken(e.target.value);
  };

  const addFlywheel = useCallback(async () => {
    if (poolData && poolId && rewardToken) {
      try {
        setIsAdding(true);
        const comptroller = sdk.createComptroller(poolData.comptroller);
        const tx = await comptroller.functions._addRewardsDistributor(rewardToken, {
          from: address,
        });
        await tx.wait();
        successToast({ description: 'Flywheel added to pool!' });
      } catch (e) {
        handleGenericError(e, errorToast);
      } finally {
        setIsAdding(false);
      }
    }
  }, [address, poolData, errorToast, rewardToken, sdk, successToast, poolId]);

  return (
    <Box width="100%">
      <Accordion allowToggle>
        <AccordionItem borderWidth={1} borderColor="teal">
          <h2>
            <AccordionButton _expanded={{ bg: 'teal', color: 'white' }}>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Add Existing Flywheel
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
                {allPools && poolId && (
                  <FormControl flex={3}>
                    <FormLabel>Input existing reward token address</FormLabel>
                    <Input type="text" onChange={onChangeRewardToken} value={rewardToken} />
                  </FormControl>
                )}
              </Flex>

              <Button
                ml="auto"
                width="100px"
                colorScheme="teal"
                onClick={addFlywheel}
                isLoading={isAdding}
                isDisabled={isAdding || !poolId || !rewardToken}
              >
                Add
              </Button>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
