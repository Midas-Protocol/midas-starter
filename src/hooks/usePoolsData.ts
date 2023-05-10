import { useQuery } from 'react-query';

import { useSDK } from '@context/SDKContext';

export const usePoolsData = () => {
  const { sdk, address, currentChain } = useSDK();

  return useQuery(
    ['allPools', address, sdk.chainId],
    async () => {
      return await sdk.fetchPoolsManual({
        from: address,
      });
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!address && !!currentChain.id }
  );
};
