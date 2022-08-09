import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Text,
} from '@chakra-ui/react';
import { BigNumber, utils } from 'ethers';
import { useQuery } from 'react-query';

import { useSDK } from '@context/SDKContext';

export const Tvllocked = () => {
  const { sdk, currentChain } = useSDK();

  const { data: tvlNative } = useQuery<BigNumber>(
    ['tvl', currentChain.id],
    async () => {
      const tvlNative = await sdk.getTotalValueLocked(false);

      return tvlNative;
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!currentChain.id }
  );

  return (
    <Box width="100%">
      <Accordion allowToggle>
        <AccordionItem borderWidth={1} borderColor="teal">
          <h2>
            <AccordionButton _expanded={{ bg: 'teal', color: 'white' }}>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Get TVL Locked
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex direction="column" gap={4}>
              <Flex width="100%" direction="row" gap={4}>
                <FormControl flex={1}>
                  <FormLabel>TVL native locked</FormLabel>
                  <Text>{tvlNative && utils.formatUnits(tvlNative)}</Text>
                </FormControl>
              </Flex>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
