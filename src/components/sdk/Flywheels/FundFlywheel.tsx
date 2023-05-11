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
import { utils } from 'ethers';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';

import { useSDK } from '@context/SDKContext';
import { Flywheel, useFlywheelsForPool } from '@hooks/useFlywheelsForPool';
import { usePoolData } from '@hooks/usePoolData';
import { usePoolsData } from '@hooks/usePoolsData';
import { useErrorToast, useSuccessToast } from '@hooks/useToast';
import { handleGenericError } from '@utils/errorHandling';

export const FundFlywheel = () => {
  const { sdk, address } = useSDK();

  const [fundingAmount, setFundingAmount] = useState<string>('');
  const [poolId, setPoolId] = useState<string>('');
  const [isFunding, setIsFunding] = useState(false);
  const [flywheelId, setFlywheelId] = useState<string>('');
  const [flywheel, setFlywheel] = useState<Flywheel | undefined>();

  const { data: allPools } = usePoolsData();
  const { data: poolData } = usePoolData(poolId);
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

  const onPoolChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPoolId(e.target.value);
  };

  const onChangeFundingAmount = (e: ChangeEvent<HTMLInputElement>) => {
    setFundingAmount(e.target.value);
  };

  const onFlywheelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFlywheelId(e.target.value);
  };

  const fund = async () => {
    if (flywheel) {
      const token = sdk.getEIP20TokenInstance(flywheel.rewardToken, sdk.signer);

      setIsFunding(true);

      try {
        // TODO use rewardsTokens decimals here
        const tx = await token.transfer(
          flywheel.rewards,
          utils.parseUnits(fundingAmount.toString())
        );
        await tx.wait();
        successToast({ description: 'Successfully set!' });
      } catch (err) {
        handleGenericError(err, errorToast);
      } finally {
        setIsFunding(false);
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
                {allPools && poolId && (
                  <>
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
                    <FormControl flex={2}>
                      <FormLabel>Input amount</FormLabel>
                      <Input type="text" onChange={onChangeFundingAmount} value={fundingAmount} />
                    </FormControl>
                  </>
                )}
              </Flex>

              <Button
                ml="auto"
                width="100px"
                colorScheme="teal"
                onClick={fund}
                isLoading={isFunding}
                isDisabled={isFunding || !poolId || !flywheel}
              >
                Fund
              </Button>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
