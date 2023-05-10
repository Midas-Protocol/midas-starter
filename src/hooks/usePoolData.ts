import { FusePoolData } from '@midas-capital/types';
import { useQuery } from 'react-query';

import { useSDK } from '@context/SDKContext';

export const usePoolData = (poolId: string) => {
  const { sdk, address } = useSDK();

  return useQuery<FusePoolData | null>(
    ['usePoolData', poolId, address],
    async () => {
      const res = await sdk.fetchFusePoolData(poolId, address);

      return res;
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!poolId && !!address }
  );
};
