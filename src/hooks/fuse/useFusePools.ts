import { JsonRpcProvider } from '@ethersproject/providers';
import { filterOnlyObjectProperties, Fuse } from '@midas-capital/sdk';
import { FusePoolDirectory } from '@midas-capital/sdk/dist/cjs/typechain/FusePoolDirectory';
import { FusePoolLens } from '@midas-capital/sdk/dist/cjs/typechain/FusePoolLens';
import { BigNumber, BigNumberish } from 'ethers';
import FuseJS from 'fuse.js';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

import { NATIVE_TOKEN_DATA } from '@constants/networkData';
import { useRari } from '@context/RariContext';
import { fetchCoinGeckoPrice } from '@utils/coingecko';
import { formatDateToDDMMYY } from '@utils/dateUtils';
import { blockNumberToTimeStamp } from '@utils/web3utils';

interface LensFusePool {
  blockPosted: BigNumberish;
  comptroller: string;
  timestampPosted: string;
}

interface LensFusePoolData {
  totalBorrow: string;
  totalSupply: string;
  underlyingSymbols: string[];
  underlyingTokens: string[];
  whitelistedAdmin: boolean;
}

export type LensPoolsWithData = [
  ids: BigNumberish[],
  fusePools: FusePoolDirectory.FusePoolStructOutput[],
  fusePoolsData: FusePoolLens.FusePoolDataStructOutput[],
  errors: boolean[]
];

// TODO
// unable to extend FusePoolDirectory.FusePoolStructOutput,FusePoolLens.FusePoolDataStructOutput here as the the indexes are incompatible :facepalm:
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

export const fetchPools = async ({
  fuse,
  address,
  filter,
  blockNum,
}: {
  fuse: Fuse;
  address: string;
  filter: string | null;
  blockNum?: number;
}) => {
  const isCreatedPools = filter === 'created-pools';
  const isVerifiedPools = filter === 'verified-pools';
  const isUnverifiedPools = filter === 'unverified-pools';

  const latestBlockNumber = await fuse.provider.getBlockNumber();
  const _blockNum = blockNum ? blockNum : latestBlockNumber;

  // Get the unix timestamp of the blockNumber
  const startBlockTimestamp = await blockNumberToTimeStamp(
    fuse.provider as JsonRpcProvider,
    _blockNum
  );

  const ddMMYYYY = formatDateToDDMMYY(new Date(startBlockTimestamp * 1000));

  const nativeAssetPriceInUSD = blockNum
    ? await fetchCoinGeckoPrice(NATIVE_TOKEN_DATA[fuse.chainId].coingeckoId, ddMMYYYY)
    : await fetchCoinGeckoPrice(NATIVE_TOKEN_DATA[fuse.chainId].coingeckoId);

  const req = isCreatedPools
    ? fuse.contracts.FusePoolLens.callStatic.getPoolsByAccountWithData(address)
    : isVerifiedPools
    ? fuse.contracts.FusePoolLens.callStatic.getPublicPoolsByVerificationWithData(true)
    : isUnverifiedPools
    ? fuse.contracts.FusePoolLens.callStatic.getPublicPoolsByVerificationWithData(false)
    : // or else get all pools
      fuse.contracts.FusePoolLens.callStatic.getPublicPoolsWithData();

  const whitelistedPoolsRequest =
    fuse.contracts.FusePoolLens.callStatic.getWhitelistedPoolsByAccountWithData(address);

  const [pools, whitelistedPools] = await Promise.all([req, whitelistedPoolsRequest]).then(
    (responses) => responses.map((poolData) => mergePoolData(poolData, nativeAssetPriceInUSD))
  );

  const whitelistedIds = whitelistedPools.map((pool) => pool.id);
  const filteredPools = pools.filter((pool) => !whitelistedIds.includes(pool.id));

  return [...filteredPools, ...whitelistedPools];
};

interface UseFusePoolsReturn {
  pools: MergedPool[] | undefined;
  filteredPools: MergedPool[];
  isLoading: boolean;
}

// returns impersonal data about fuse pools ( can filter by your supplied/created pools )
export const useFusePools = (
  filter: 'created-pools' | 'verified-pools' | 'unverified-pools' | string | null
): UseFusePoolsReturn => {
  const { fuse, address, chainId } = useRari();

  const isCreatedPools = filter === 'created-pools';
  const isAllPools = filter === '';
  const { isLoading, data: pools } = useQuery(
    ['FusePoolList', chainId, filter, address],
    async () => {
      if (!filter) {
        return await fetchPoolsManual({
          fuse,
          address,
          verification: false,
        });
      }
      return await fetchPools({ fuse, address, filter });
    },
    {
      enabled: !!chainId,
    }
  );

  const filteredPools = useMemo(() => {
    if (!pools?.length) {
      return [];
    }

    if (!filter) {
      return poolSort(pools);
    }

    if (isCreatedPools || isAllPools) {
      return poolSort(pools);
    }

    const options = {
      keys: ['name', 'id', 'underlyingTokens', 'underlyingSymbols'],
      threshold: 0.3,
    };

    const filtered = new FuseJS(pools, options).search(filter);
    return poolSort(filtered.map((item) => item.item));
  }, [pools, filter, isCreatedPools, isAllPools]);

  return { pools, filteredPools, isLoading };
};
