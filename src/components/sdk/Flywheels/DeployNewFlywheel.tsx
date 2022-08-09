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
import { FlywheelStaticRewards } from '@midas-capital/sdk/dist/cjs/lib/contracts/typechain/FlywheelStaticRewards';
import { FuseFlywheelCore } from '@midas-capital/sdk/dist/cjs/lib/contracts/typechain/FuseFlywheelCore';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';

import { useSDK } from '@context/SDKContext';
import { usePoolData } from '@hooks/usePoolData';
import { usePoolsData } from '@hooks/usePoolsData';
import { useErrorToast, useSuccessToast } from '@hooks/useToast';
import { handleGenericError } from '@utils/errorHandling';

export const DeployNewFlywheel = () => {
  const { sdk, address } = useSDK();

  const [rewardToken, setRewardToken] = useState<string>('');
  const [poolId, setPoolId] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState(false);

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

  const handleDeploy = async () => {
    if (poolData && poolId && rewardToken) {
      try {
        setIsDeploying(true);
        let fwCore: FuseFlywheelCore;

        try {
          fwCore = await sdk.deployFlywheelCore(rewardToken, {
            from: address,
          });
          await fwCore.deployTransaction.wait();
          successToast({
            description: 'Flywheel Core Deployed',
          });
        } catch (err) {
          throw 'Failed to deploy Flywheel Core';
        }

        let fwStaticRewards: FlywheelStaticRewards;
        try {
          fwStaticRewards = await sdk.deployFlywheelStaticRewards(fwCore.address, {
            from: address,
          });
          await fwStaticRewards.deployTransaction.wait();
          successToast({
            description: 'Flywheel Rewards Deployed',
          });
        } catch (err) {
          throw 'Failed to deploy Flywheel Rewards';
        }

        if (!fwStaticRewards) {
          throw 'No Flywheel Rewards deployed';
        }

        try {
          const tx = await sdk.setFlywheelRewards(fwCore.address, fwStaticRewards.address, {
            from: address,
          });
          await tx.wait();
          successToast({
            description: 'Rewards Added to Flywheel',
          });
        } catch (e) {
          throw 'Failed to add Rewards to Flywheel';
        }

        try {
          const tx = await sdk.addFlywheelCoreToComptroller(fwCore.address, poolData.comptroller, {
            from: address,
          });
          await tx.wait();
          successToast({
            description: 'Flywheel added to Pool',
          });
        } catch (e) {
          throw 'Failed to add Flywheel to Pool';
        }

        setIsDeploying(false);
      } catch (e) {
        setIsDeploying(false);
        handleGenericError(e, errorToast);
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
                Deploy New Flywheel
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
                    <FormLabel>Input new reward token address</FormLabel>
                    <Input type="text" onChange={onChangeRewardToken} value={rewardToken} />
                  </FormControl>
                )}
              </Flex>

              <Button
                ml="auto"
                width="100px"
                colorScheme="teal"
                onClick={handleDeploy}
                isLoading={isDeploying}
                isDisabled={isDeploying || !poolId || !rewardToken}
              >
                Deploy
              </Button>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
