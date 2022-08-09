import { useQuery } from 'react-query';

import { useSDK } from '@context/SDKContext';

export interface Flywheel {
  address: string;
  authority: string;
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

      const flywheelCores = await sdk.getFlywheelsByPool(comptrollerAddress, {
        from: await sdk.provider.getSigner().getAddress(),
      });

      if (!flywheelCores.length) return [];

      const flywheels: Flywheel[] = await Promise.all(
        flywheelCores.map(async (flywheel) => {
          // TODO add function to FlywheelLensRouter to get all info in one call
          const [authority, booster, rewards, markets, owner, rewardToken] = await Promise.all([
            flywheel.callStatic.authority(),
            flywheel.callStatic.flywheelBooster(),
            flywheel.callStatic.flywheelRewards(),
            flywheel.callStatic.getAllStrategies(),
            flywheel.callStatic.owner(),
            flywheel.callStatic.rewardToken(),
          ]);

          return {
            address: flywheel.address,
            authority,
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
