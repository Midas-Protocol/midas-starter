import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FusePoolData, NativePricedFuseAsset } from '@midas-capital/sdk';
import { BigNumber } from 'ethers';
import { useCallback, useState } from 'react';
import { useQuery } from 'react-query';

import { useSDK } from '@context/SDKContext';

export const PoolAssets = () => {
  const { sdk, address, currentChain } = useSDK();
  const [poolId, setPoolId] = useState('0');

  const { data: poolData } = useQuery(
    ['getMarkets', poolId, currentChain.id],
    () => {
      return sdk.fetchFusePoolData(poolId);
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!poolId && !!currentChain.id,
    }
  );

  const supply = useCallback(
    (poolData: FusePoolData, asset: NativePricedFuseAsset) => () => {
      sdk.supply(
        asset.cToken,
        asset.underlyingToken,
        poolData.comptroller,
        true,
        BigNumber.from(0.01),
        { from: address }
      );
    },
    [sdk, address]
  );

  return (
    <Box width="100%">
      <Accordion allowToggle>
        <AccordionItem borderWidth={1} borderColor="teal">
          <h2>
            <AccordionButton _expanded={{ bg: 'teal', color: 'white' }}>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Pool Assets
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <VStack>
              <HStack>
                <Text size={'md'}>Pool Id</Text>
                <Input
                  placeholder="Fuse Pool"
                  value={poolId}
                  onChange={(e) => setPoolId(e.target.value)}
                />
              </HStack>
              <Heading size={'sm'}>Value: {'Assets'}</Heading>
              {poolData &&
                poolData.assets.map((a) => (
                  <HStack key={a.cToken}>
                    <Text>{a.cToken}</Text>
                    <Button onClick={supply(poolData, a)}>Supply 0.01</Button>
                  </HStack>
                ))}
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
export default PoolAssets;
