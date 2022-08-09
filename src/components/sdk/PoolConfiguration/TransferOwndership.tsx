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
import { utils } from 'ethers';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';

import { useSDK } from '@context/SDKContext';
import { usePoolData } from '@hooks/usePoolData';
import { usePoolsData } from '@hooks/usePoolsData';
import { useErrorToast, useSuccessToast } from '@hooks/useToast';
import { handleGenericError } from '@utils/errorHandling';

export const TransferOwnership = () => {
  const { sdk, address } = useSDK();
  const [poolId, setPoolId] = useState<string>('');

  const [transferAddress, setTransferAddress] = useState<string>('');
  const [isTranserring, setIsTransferring] = useState<boolean>(false);
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

  const onChangePoolName = (e: ChangeEvent<HTMLInputElement>) => {
    setTransferAddress(e.target.value);
  };

  const onTransferOwnership = async () => {
    if (transferAddress && poolData) {
      try {
        setIsTransferring(true);
        const verifiedAddress = utils.getAddress(transferAddress.toLowerCase());

        const unitroller = sdk.createUnitroller(poolData.comptroller);

        const tx = await unitroller._setPendingAdmin(verifiedAddress);
        await tx.wait();
        await queryClient.refetchQueries();

        successToast({
          description: `${verifiedAddress} can now become the admin of this pool!`,
        });
      } catch (e) {
        handleGenericError(e, errorToast);
      } finally {
        setIsTransferring(false);
        setTransferAddress('');
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
                Transfer ownership
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex direction="column" gap={4}>
              <Heading size="md">You can transfer ownership of pool only you created</Heading>
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
                    <FormLabel>Input address which you want to transfer ownership to</FormLabel>
                    <Input type="text" onChange={onChangePoolName} value={transferAddress} />
                  </FormControl>
                )}
              </Flex>

              <Button
                ml="auto"
                width="100px"
                colorScheme="teal"
                onClick={onTransferOwnership}
                isLoading={isTranserring}
                isDisabled={isTranserring || !poolId || !transferAddress}
              >
                Transfer
              </Button>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
