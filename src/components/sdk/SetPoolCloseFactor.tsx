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
import { ComptrollerErrorCodes } from '@midas-capital/sdk';
import { BigNumber, ContractTransaction, utils } from 'ethers';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';

import { CLOSE_FACTOR } from '@constants/constants';
import { useSDK } from '@context/SDKContext';
import { useExtraPoolInfo } from '@hooks/useExtraPoolInfo';
import { usePoolData } from '@hooks/usePoolData';
import { usePoolsData } from '@hooks/usePoolsData';
import { useErrorToast, useSuccessToast } from '@hooks/useToast';
import { handleGenericError } from '@utils/errorHandling';

export const SetPoolCloseFactor = () => {
  const { sdk, address } = useSDK();
  const [poolId, setPoolId] = useState<string>('');

  const [closeFactor, setCloseFactor] = useState<string>('');
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
      setCloseFactor(utils.formatUnits(extraPoolData.closeFactor, 16));
    }
  }, [extraPoolData]);

  const onPoolChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPoolId(e.target.value);
  };

  const onChangeCloseFactor = (e: ChangeEvent<HTMLInputElement>) => {
    setCloseFactor(e.target.value);
  };

  const onSetCloseFactor = async () => {
    if (closeFactor && poolData && poolId) {
      setIsSetting(true);
      // 50% -> 0.5 * 1e18
      const bigCloseFactor: BigNumber = utils.parseUnits((Number(closeFactor) / 100).toString());

      const comptroller = sdk.createComptroller(poolData.comptroller);

      try {
        const response = await comptroller.callStatic._setCloseFactor(bigCloseFactor);

        if (!response.eq(0)) {
          const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

          throw err;
        }

        const tx: ContractTransaction = await comptroller._setCloseFactor(bigCloseFactor);
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
                Set close factor
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex direction="column" gap={4}>
              <Heading size="md">You can set close factor of pool only you owned</Heading>
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
                      Input close factor (
                      {extraPoolData?.closeFactor &&
                        `Currently set as ${utils.formatUnits(extraPoolData.closeFactor, 16)}, `}
                      should be a number between {CLOSE_FACTOR.MIN} and {CLOSE_FACTOR.MAX})
                    </FormLabel>
                    <Input type="number" onChange={onChangeCloseFactor} value={closeFactor} />
                  </FormControl>
                )}
              </Flex>

              <Button
                ml="auto"
                width="100px"
                colorScheme="teal"
                onClick={onSetCloseFactor}
                isLoading={isSetting}
                isDisabled={
                  isSetting ||
                  !poolId ||
                  !closeFactor ||
                  Number(closeFactor) < CLOSE_FACTOR.MIN ||
                  Number(closeFactor) > CLOSE_FACTOR.MAX ||
                  (extraPoolData &&
                    Number(closeFactor) ===
                      Number(utils.formatUnits(extraPoolData.closeFactor, 16)))
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
