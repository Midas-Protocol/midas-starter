import { useQuery } from 'react-query';

import { useSDK } from '@context/SDKContext';

export const useExtraPoolInfo = (comptrollerAddress: string) => {
  const { sdk, currentChain, address } = useSDK();

  const { data } = useQuery(
    ['ExtraPoolInfo', currentChain.id, comptrollerAddress],
    async () => {
      if (comptrollerAddress) {
        const comptroller = sdk.createComptroller(comptrollerAddress);
        const oracle = sdk.getPriceOracle(await comptroller.callStatic.oracle());
        const [
          { 0: admin, 1: upgradeable },
          closeFactor,
          liquidationIncentive,
          enforceWhitelist,
          whitelist,
          pendingAdmin,
        ] = await Promise.all([
          sdk.contracts.FusePoolLensSecondary.callStatic.getPoolOwnership(comptrollerAddress),

          comptroller.callStatic.closeFactorMantissa(),

          comptroller.callStatic.liquidationIncentiveMantissa(),

          (() => {
            return comptroller.callStatic
              .enforceWhitelist()
              .then((x: boolean) => x)
              .catch(() => false);
          })(),

          (() => {
            return comptroller.callStatic
              .getWhitelist()
              .then((x: string[]) => x)
              .catch(() => []);
          })(),

          comptroller.callStatic.pendingAdmin(),
        ]);

        return {
          admin,
          upgradeable,
          enforceWhitelist,
          whitelist: whitelist as string[],
          isPowerfulAdmin: admin.toLowerCase() === address.toLowerCase() && upgradeable,
          oracle,
          closeFactor,
          liquidationIncentive,
          pendingAdmin,
          isPendingAdmin: pendingAdmin.toLowerCase() === address.toLowerCase(),
        };
      }
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!currentChain.id && !!comptrollerAddress }
  );

  return data;
};
