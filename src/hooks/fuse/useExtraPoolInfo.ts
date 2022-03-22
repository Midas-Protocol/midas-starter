import { useQuery } from 'react-query';

import { useRari } from '@context/RariContext';
import { createComptroller } from '@utils/createComptroller';

export const useExtraPoolInfo = (comptrollerAddress: string) => {
  const { fuse, address, chainId } = useRari();

  const { data } = useQuery(['ExtraPoolInfo', chainId, comptrollerAddress], async () => {
    if (comptrollerAddress) {
      const comptroller = createComptroller(comptrollerAddress, fuse);
      const [
        { 0: admin, 1: upgradeable },
        oracle,
        closeFactor,
        liquidationIncentive,
        enforceWhitelist,
        whitelist,
        pendingAdmin,
      ] = await Promise.all([
        fuse.contracts.FusePoolLensSecondary.callStatic.getPoolOwnership(comptrollerAddress),
        fuse.getPriceOracle(await comptroller.callStatic.oracle()),

        comptroller.callStatic.closeFactorMantissa(),

        comptroller.callStatic.liquidationIncentiveMantissa(),

        // TODO wtf?
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
      };
    }
  });

  return data;
};
