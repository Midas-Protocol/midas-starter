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
  Switch,
  Text,
} from '@chakra-ui/react';
import { ComptrollerErrorCodes } from '@midas-capital/types';
import { utils } from 'ethers';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';

import { useSDK } from '@context/SDKContext';
import { useExtraPoolInfo } from '@hooks/useExtraPoolInfo';
import { usePoolData } from '@hooks/usePoolData';
import { usePoolsData } from '@hooks/usePoolsData';
import { useErrorToast, useSuccessToast } from '@hooks/useToast';
import { handleGenericError } from '@utils/errorHandling';

export const SetWhitelist = () => {
  const { sdk, address } = useSDK();
  const [poolId, setPoolId] = useState<string>('');

  const [whitelistAddress, setWhitelistAddress] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const { data: allPools } = usePoolsData();
  const { data: poolData } = usePoolData(poolId);
  const extraData = useExtraPoolInfo(poolData?.comptroller || '');

  const [addresses, setAddresses] = useState<string[]>(extraData?.whitelist || []);
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

  const onChangeInputAddress = (e: ChangeEvent<HTMLInputElement>) => {
    setWhitelistAddress(e.target.value);
  };

  const changeWhitelistStatus = async (enforce: boolean) => {
    if (poolData) {
      const comptroller = sdk.createComptroller(poolData.comptroller);

      try {
        const response = await comptroller.callStatic._setWhitelistEnforcement(enforce);
        if (!response.eq(0)) {
          const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

          throw err;
        }
        const tx = await comptroller._setWhitelistEnforcement(enforce);
        await tx.wait();
        await queryClient.refetchQueries();

        successToast({ description: 'Status changed' });
      } catch (e) {
        handleGenericError(e, errorToast);
      }
    }
  };

  const onSetWhitelist = async () => {
    if (whitelistAddress && poolData && extraData) {
      setIsAdding(true);
      const validAddress = utils.getAddress(whitelistAddress.toLowerCase());
      const comptroller = sdk.createComptroller(poolData.comptroller);

      const newList = [...extraData.whitelist, validAddress];

      try {
        const response = await comptroller.callStatic._setWhitelistStatuses(
          newList,
          Array(newList.length).fill(true)
        );

        if (!response.eq(0)) {
          const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

          throw err;
        }

        const tx = await comptroller._setWhitelistStatuses(
          newList,
          Array(newList.length).fill(true)
        );
        await tx.wait();
        await queryClient.refetchQueries();

        successToast({ description: 'Whitelist is updated!' });

        setAddresses(newList);
        setWhitelistAddress('');
      } catch (e) {
        handleGenericError(e, errorToast);
      } finally {
        setIsAdding(false);
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
                Set Whitelist
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex direction="column" gap={4}>
              <Heading size="md">You can set whitelist addresses to pool only you created</Heading>
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
                {extraData && (
                  <>
                    <FormControl flex={2}>
                      <FormLabel htmlFor="email-alerts" mb="0">
                        Enforce whitelist
                      </FormLabel>
                      <Switch
                        isChecked={extraData.enforceWhitelist}
                        isDisabled={!extraData.upgradeable}
                        mt="20px"
                        onChange={() => {
                          changeWhitelistStatus(!extraData.enforceWhitelist);
                        }}
                      />
                    </FormControl>
                    {allPools && poolId && extraData.enforceWhitelist && (
                      <FormControl flex={3}>
                        <FormLabel>Input address</FormLabel>
                        <Input
                          type="text"
                          onChange={onChangeInputAddress}
                          value={whitelistAddress}
                        />
                      </FormControl>
                    )}
                  </>
                )}
              </Flex>
              <Flex direction="column" gap={4}>
                <Text>{addresses}</Text>
              </Flex>

              <Button
                ml="auto"
                width="100px"
                colorScheme="teal"
                onClick={onSetWhitelist}
                isLoading={isAdding}
                isDisabled={isAdding || !poolId || !whitelistAddress}
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
