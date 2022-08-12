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
  Input,
  Select,
} from '@chakra-ui/react';
import { ComptrollerErrorCodes } from '@midas-capital/types';
import { BigNumber, utils } from 'ethers';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';

import { LIQUIDATION_INCENTIVE } from '@constants/constants';
import { useSDK } from '@context/SDKContext';
import { useExtraPoolInfo } from '@hooks/useExtraPoolInfo';
import { usePoolData } from '@hooks/usePoolData';
import { usePoolsData } from '@hooks/usePoolsData';
import { useErrorToast, useSuccessToast } from '@hooks/useToast';
import { handleGenericError } from '@utils/errorHandling';

export const SetPoolLiquidationIncentive = () => {
  const { sdk, address } = useSDK();
  const [poolId, setPoolId] = useState<string>('');

  const [liquidationIncentive, setLiquidationIncentive] = useState<string>('');
  const [isSetting, setIsSetting] = useState<boolean>(false);
  const { data: allPools } = usePoolsData();
  const { data: poolData } = usePoolData(poolId);
  const extraPoolData = useExtraPoolInfo(poolData?.comptroller || '');
  const errorToast = useErrorToast();
  const successToast = useSuccessToast();
  const queryClient = useQueryClient();

  const availablePools = useMemo(() => {
    return allPools?.filter((pool) => pool?.creator === address);
  }, [allPools, address]);

  useEffect(() => {
    setPoolId('');
  }, [allPools]);

  useEffect(() => {
    if (extraPoolData) {
      setLiquidationIncentive(
        (Number(utils.formatUnits(extraPoolData.liquidationIncentive, 16)) - 100).toString()
      );
    }
  }, [extraPoolData]);

  const onPoolChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPoolId(e.target.value);
  };

  const onChangeliquidationIncentive = (e: ChangeEvent<HTMLInputElement>) => {
    setLiquidationIncentive(e.target.value);
  };

  const onsetLiquidationIncentive = async () => {
    if (liquidationIncentive && poolData && poolId) {
      setIsSetting(true);
      // 8% -> 1.08 * 1e8
      const bigLiquidationIncentive: BigNumber = utils.parseUnits(
        (Number(liquidationIncentive) / 100 + 1).toString()
      );

      const comptroller = sdk.createComptroller(poolData.comptroller);

      try {
        const response = await comptroller.callStatic._setLiquidationIncentive(
          bigLiquidationIncentive
        );

        if (!response.eq(0)) {
          const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

          throw err;
        }

        const tx = await comptroller._setLiquidationIncentive(bigLiquidationIncentive);
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
                Set liquidation incentive
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex direction="column" gap={4}>
              <Heading size="md">You can set liquidation incentive of pool only you owned</Heading>
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
                    <FormLabel>
                      Input liquidation incentive (
                      {extraPoolData?.liquidationIncentive &&
                        `Currently set as ${
                          Number(utils.formatUnits(extraPoolData.liquidationIncentive, 16)) - 100
                        }, `}
                      should be a number between {LIQUIDATION_INCENTIVE.MIN} and{' '}
                      {LIQUIDATION_INCENTIVE.MAX})
                    </FormLabel>
                    <Input
                      type="number"
                      onChange={onChangeliquidationIncentive}
                      value={liquidationIncentive}
                    />
                  </FormControl>
                )}
              </Flex>

              <Button
                ml="auto"
                width="100px"
                colorScheme="teal"
                onClick={onsetLiquidationIncentive}
                isLoading={isSetting}
                isDisabled={
                  isSetting ||
                  !poolId ||
                  !liquidationIncentive ||
                  Number(liquidationIncentive) < LIQUIDATION_INCENTIVE.MIN ||
                  Number(liquidationIncentive) > LIQUIDATION_INCENTIVE.MAX ||
                  (extraPoolData &&
                    Number(liquidationIncentive) + 100 ===
                      Number(utils.formatUnits(extraPoolData.liquidationIncentive, 16)))
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
