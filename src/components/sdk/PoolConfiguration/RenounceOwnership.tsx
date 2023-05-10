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
  Select,
} from '@chakra-ui/react';
import { ComptrollerErrorCodes } from '@midas-capital/types';
import { Contract, ContractTransaction } from 'ethers';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';

import { useSDK } from '@context/SDKContext';
import { usePoolData } from '@hooks/usePoolData';
import { usePoolsData } from '@hooks/usePoolsData';
import { useErrorToast, useSuccessToast } from '@hooks/useToast';
import { handleGenericError } from '@utils/errorHandling';

export const RenounceOwnership = () => {
  const { sdk, address } = useSDK();
  const [poolId, setPoolId] = useState<string>('');

  const [isRenouncing, setIsRenouncing] = useState<boolean>(false);
  const { data: allPools } = usePoolsData();
  const { data: poolData } = usePoolData(poolId);
  const errorToast = useErrorToast();
  const successToast = useSuccessToast();
  const queryClient = useQueryClient();

  const availablePools = useMemo(() => {
    return allPools?.filter((pool) => pool?.creator === address);
  }, [allPools, address]);

  useEffect(() => {
    setPoolId('');
  }, [allPools]);

  const onPoolChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPoolId(e.target.value);
  };

  const onRenounceOwnership = async () => {
    if (poolId && poolData) {
      setIsRenouncing(true);
      const unitroller = new Contract(
        poolData.comptroller,
        sdk.artifacts.Unitroller.abi,
        sdk.provider.getSigner()
      );

      try {
        const response = await unitroller.callStatic._toggleAdminRights(false);
        if (!response.eq(0)) {
          const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

          throw err;
        }

        const tx: ContractTransaction = await unitroller._toggleAdminRights(false);
        await tx.wait();

        await queryClient.refetchQueries();

        successToast({ description: 'Successfully renounced!' });
      } catch (e) {
        handleGenericError(e, errorToast);
      } finally {
        setIsRenouncing(false);
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
                Renounce ownership
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex direction="column" gap={4}>
              <Heading size="md">You can renounce ownership of pool only you created</Heading>
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
              </Flex>

              <Button
                ml="auto"
                width="100px"
                colorScheme="teal"
                onClick={onRenounceOwnership}
                isLoading={isRenouncing}
                isDisabled={isRenouncing || !poolId}
              >
                Renounce
              </Button>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
