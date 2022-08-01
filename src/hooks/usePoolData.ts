import { FusePoolData } from '@midas-capital/sdk';
import { useQuery } from 'react-query';

import { useSDK } from '@context/SDKContext';

export const usePoolData = (poolId: string) => {
  const { sdk, address, currentChain } = useSDK();

  return useQuery<FusePoolData | null>(
    ['usePoolData', poolId, address, currentChain.id],
    async () => {
      return await sdk.fetchFusePoolData(poolId, address);
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!poolId && !!address }
  );
};
