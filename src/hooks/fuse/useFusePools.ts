import { filterOnlyObjectProperties, Fuse } from '@midas-capital/sdk';
import { FusePoolDirectory } from '@midas-capital/sdk/dist/cjs/typechain/FusePoolDirectory';
import { FusePoolLens } from '@midas-capital/sdk/dist/cjs/typechain/FusePoolLens';
import { BigNumber, BigNumberish } from 'ethers';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

import { NATIVE_TOKEN_DATA } from '@constants/networkData';
import { useRari } from '@context/RariContext';
import { fetchCoinGeckoPrice } from '@utils/coingecko';

export type LensPoolsWithData = [
  ids: BigNumberish[],
  fusePools: FusePoolDirectory.FusePoolStructOutput[],
  fusePoolsData: FusePoolLens.FusePoolDataStructOutput[],
  errors: boolean[]
];
export interface MergedPool {
  id: number;
  name: string;
  creator: string;
  comptroller: string;
  blockPosted: BigNumber;
  timestampPosted: BigNumber;
  suppliedUSD: number;
  borrowedUSD: number;
  totalSupply: BigNumber;
  totalBorrow: BigNumber;
  underlyingTokens: string[];
  underlyingSymbols: string[];
  whitelistedAdmin: boolean;
}

const poolSort = (pools: MergedPool[]) => {
  return pools.sort((a, b) => {
    if (b.suppliedUSD > a.suppliedUSD) {
      return 1;
    }

    if (b.suppliedUSD < a.suppliedUSD) {
      return -1;
    }

    // They're equal, let's sort by pool number:
    return b.id > a.id ? 1 : -1;
  });
};

const mergePoolData = (data: LensPoolsWithData, nativeAssetPriceInUSD: number): MergedPool[] => {
  const [ids, fusePools, fusePoolsData] = data;

  return ids.map((_id, i) => {
    const id = parseFloat(ids[i].toString());
    const fusePool = fusePools[i];
    const fusePoolData = fusePoolsData[i];

    return {
      id,
      suppliedUSD:
        (parseFloat(
          fusePoolData.totalSupply
            ? fusePoolData.totalSupply.toString()
            : fusePoolData[0].toString()
        ) /
          1e18) *
        nativeAssetPriceInUSD,
      borrowedUSD:
        (parseFloat(
          fusePoolData.totalBorrow
            ? fusePoolData.totalBorrow.toString()
            : fusePoolData[1].toString()
        ) /
          1e18) *
        nativeAssetPriceInUSD,
      ...filterOnlyObjectProperties(fusePool),
      ...filterOnlyObjectProperties(fusePoolData),
    };
  });
};

export const fetchPoolsManual = async ({
  fuse,
  address,
  verification = false,
}: {
  fuse: Fuse;
  address: string;
  verification?: boolean;
}) => {
  // Query Directory
  const fusePoolsDirectoryResult =
    await fuse.contracts.FusePoolDirectory.callStatic.getPublicPoolsByVerification(verification, {
      from: address,
    });

  // Extract data from Directory call
  const poolIds: string[] = (fusePoolsDirectoryResult[0] ?? []).map((bn: BigNumber) =>
    bn.toString()
  );
  const fusePools = fusePoolsDirectoryResult[1];

  const comptrollers = fusePools.map(({ comptroller }) => comptroller);

  const fusePoolsData: FusePoolLens.FusePoolDataStructOutput[] = [];
  for (const comptroller of comptrollers) {
    try {
      // TODO: SDK typing has a hiccup here, should return `FusePoolLens.FusePoolDataStructOutput`
      const rawData = await fuse.contracts.FusePoolLens.callStatic.getPoolSummary(comptroller);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = [...rawData];
      data.totalSupply = rawData[0];
      data.totalBorrow = rawData[1];
      data.underlyingTokens = rawData[2];
      data.underlyingSymbols = rawData[3];
      data.whitelistedAdmin = rawData[4];
      fusePoolsData.push(data as FusePoolLens.FusePoolDataStructOutput);
    } catch (err) {
      console.error(`Error querying poolSummaries for Pool: ${comptroller}`, err);
      return [];
    }
  }

  const nativeAssetPriceInUSD = await fetchCoinGeckoPrice(
    NATIVE_TOKEN_DATA[fuse.chainId].coingeckoId
  );

  return mergePoolData([poolIds, fusePools, fusePoolsData, []], nativeAssetPriceInUSD);
};

interface UseFusePoolsReturn {
  pools: MergedPool[] | undefined;
  filteredPools: MergedPool[];
  isLoading: boolean;
}

// returns impersonal data about fuse pools ( can filter by your supplied/created pools )
export const useFusePools = (): UseFusePoolsReturn => {
  const { fuse, address, chainId } = useRari();

  const { isLoading, data: pools } = useQuery(
    ['FusePoolList', chainId, address],
    async () => {
      return await fetchPoolsManual({
        fuse,
        address,
        verification: false,
      });
    },
    {
      enabled: !!chainId,
    }
  );

  const filteredPools = useMemo(() => {
    if (!pools?.length) {
      return [];
    }
    return poolSort(pools);
  }, [pools]);

  return { pools, filteredPools, isLoading };
};
