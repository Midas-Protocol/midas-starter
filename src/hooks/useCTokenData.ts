import { useQuery } from 'react-query';

import { useSDK } from '@context/SDKContext';

export const useCTokenData = (comptrollerAddress?: string, cTokenAddress?: string) => {
  const { sdk } = useSDK();

  const { data } = useQuery(
    ['CTokenData', cTokenAddress, comptrollerAddress],
    async () => {
      if (comptrollerAddress && cTokenAddress) {
        const comptroller = sdk.createComptroller(comptrollerAddress);
        const cToken = sdk.createCToken(cTokenAddress);

        const [
          adminFeeMantissa,
          reserveFactorMantissa,
          interestRateModelAddress,
          { collateralFactorMantissa },
        ] = await Promise.all([
          cToken.callStatic.adminFeeMantissa(),
          cToken.callStatic.reserveFactorMantissa(),
          cToken.callStatic.interestRateModel(),
          comptroller.callStatic.markets(cTokenAddress),
        ]);

        return {
          reserveFactorMantissa,
          adminFeeMantissa,
          collateralFactorMantissa,
          interestRateModelAddress,
        };
      } else {
        return undefined;
      }
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!cTokenAddress && !!comptrollerAddress }
  );

  return data;
};
