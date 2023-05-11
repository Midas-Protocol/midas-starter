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
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';

import { useSDK } from '@context/SDKContext';
import { usePoolsData } from '@hooks/usePoolsData';
import { useErrorToast, useSuccessToast } from '@hooks/useToast';
import { handleGenericError } from '@utils/errorHandling';

export const SetPoolName = () => {
  const { sdk, address } = useSDK();
  const [poolId, setPoolId] = useState<string>('');
  const [poolName, setPoolName] = useState<string>('');
  const [isSetting, setIsSetting] = useState<boolean>(false);
  const { data: allPools } = usePoolsData();
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
    setPoolName(e.target.value);
  };

  const onSetPoolName = async () => {
    if (poolId && poolName) {
      try {
        setIsSetting(true);
        const FusePoolDirectory = sdk.getFusePoolDirectoryInstance(sdk.signer);

        const tx = await FusePoolDirectory.setPoolName(poolId, poolName, {
          from: address,
        });

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
                Set Pool Name
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex direction="column" gap={4}>
              <Heading size="md">You can change the name of pool only you created</Heading>
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
                    <FormLabel>Change Pool Name</FormLabel>
                    <Input type="text" onChange={onChangePoolName} value={poolName} />
                  </FormControl>
                )}
              </Flex>

              <Button
                ml="auto"
                width="100px"
                colorScheme="teal"
                onClick={onSetPoolName}
                isLoading={isSetting}
                isDisabled={isSetting || !poolId || !poolName}
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
