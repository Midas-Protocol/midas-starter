import { useQuery } from 'react-query';

import { useSDK } from '@context/SDKContext';

export interface Flywheel {
  address: string;
  booster: string;
  owner: string;
  rewards: string;
  rewardToken: string;
  markets: string[];
}

export const useFlywheelsForPool = (comptrollerAddress?: string) => {
  const { sdk, currentChain } = useSDK();

  return useQuery(
    ['useFlywheelsForPool', currentChain.id, comptrollerAddress],
    async () => {
      if (!comptrollerAddress) return [];

      const flywheelCores = await sdk.getFlywheelsByPool(comptrollerAddress);

      if (!flywheelCores.length) return [];

      const flywheels: Flywheel[] = await Promise.all(
        flywheelCores.map(async (flywheel) => {
          // TODO add function to FlywheelLensRouter to get all info in one call
          const [booster, rewards, markets, owner, rewardToken] = await Promise.all([
            flywheel.callStatic.flywheelBooster(),
            flywheel.callStatic.flywheelRewards(),
            flywheel.callStatic.getAllStrategies(),
            flywheel.callStatic.owner(),
            flywheel.callStatic.rewardToken(),
          ]);

          return {
            address: flywheel.address,
            booster,
            owner,
            rewards,
            rewardToken,
            markets,
          };
        })
      );

      return flywheels;
    },
    {
      initialData: [],
      enabled: !!comptrollerAddress && !!currentChain && !!sdk,
    }
  );
};
