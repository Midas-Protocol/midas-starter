import { useQuery } from 'react-query';

import { useRari } from '@context/RariContext';
import { createComptroller } from '@utils/createComptroller';

export const useIsUpgradeable = (comptrollerAddress: string) => {
  const { fuse, chainId } = useRari();

  const { data } = useQuery(
    ['IsUpgradeable', chainId, comptrollerAddress],
    async () => {
      const comptroller = createComptroller(comptrollerAddress, fuse);

      const isUpgradeable: boolean = await comptroller.methods.adminHasRights().call();

      return isUpgradeable;
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!comptrollerAddress && !!chainId }
  );

  return data;
};
