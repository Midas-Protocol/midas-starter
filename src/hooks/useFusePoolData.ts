import { FusePoolData } from '@midas-capital/sdk';
import { useQuery } from 'react-query';

import { NATIVE_TOKEN_DATA } from '@constants/networkData';
import { useRari } from '@context/RariContext';

export const useFusePoolData = (poolId: string | undefined) => {
  const { fuse, address, chainId } = useRari();

  const queryResult = useQuery<FusePoolData | undefined>(
    ['FusePoolData', chainId, poolId, address],
    async () => {
      return await fuse.fetchFusePoolData(
        poolId,
        address,
        NATIVE_TOKEN_DATA[fuse.chainId].coingeckoId
      );
    }
  );

  return queryResult;
};
