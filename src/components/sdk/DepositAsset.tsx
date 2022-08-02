import { Heading, HStack, Input, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { useQuery } from 'react-query';

import { useSDK } from '@context/SDKContext';

export const DepositAsset = () => {
  const { sdk } = useSDK();
  const [market, setMarket] = useState<string>();
  const [poolId, setPoolId] = useState('0');

  const { data: poolData } = useQuery(['getMarkets', poolId], () => {
    if (sdk) {
      return sdk.fetchFusePoolData(poolId);
    }
  });

  if (!sdk) {
    return null;
  }

  return (
    <VStack>
      <HStack>
        <Text size={'md'}>Pool Id</Text>
        <Input placeholder="Fuse Pool" value={poolId} onChange={(e) => setPoolId(e.target.value)} />
      </HStack>
      <HStack>
        <Text size={'md'}>Market</Text>
        <Input
          placeholder="Market Address"
          value={market}
          onChange={(e) => setMarket(e.target.value)}
        />
      </HStack>
      <Heading size={'sm'}>Value: {'Assets'}</Heading>
      {poolData && poolData.assets.map((a) => <Text key={a.cToken}>{a.cToken}</Text>)}
    </VStack>
  );
};
export default DepositAsset;
