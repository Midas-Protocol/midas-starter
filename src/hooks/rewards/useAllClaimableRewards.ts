import { ClaimableReward } from '@midas-capital/sdk/dist/cjs/src/modules/RewardsDistributor';
import { useQuery } from 'react-query';

import { useRari } from '@context/RariContext';

export const useAllClaimableRewards = () => {
  const { fuse, address } = useRari();

  const queryResult = useQuery<ClaimableReward[]>(['AllClaimableRewards', address], async () => {
    return await fuse.getRewardsDistributorClaimableRewards(address, { from: address });
  });

  return queryResult;
};
