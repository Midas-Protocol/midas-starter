import { useQuery } from 'react-query';

import { useSDK } from '@context/SDKContext';

export const usePoolsData = () => {
  const { sdk, address, currentChain } = useSDK();

  return useQuery(
    ['allPools', address, currentChain.id],
    async () => {
      return await sdk.fetchPoolsManual({
        options: {
          from: address,
        },
      });
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!address && !!currentChain.id }
  );
};
