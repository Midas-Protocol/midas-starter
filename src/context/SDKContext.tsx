import { JsonRpcProvider } from '@ethersproject/providers';
import { bsc, chapel, ganache, moonbeam, neondevnet, polygon } from '@midas-capital/chains';
import { MidasSdk } from '@midas-capital/sdk';
import { ChainConfig } from '@midas-capital/types';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { Chain } from 'wagmi';

export interface SDKContextData {
  sdk: MidasSdk;
  address: string;
  disconnect: () => void;
  currentChain: Chain & {
    unsupported?: boolean | undefined;
  };
  chains: Chain[];
}

export const SDKContext = createContext<SDKContextData | undefined>(undefined);

interface SDKProviderProps {
  children: ReactNode;
  currentChain: Chain & {
    unsupported?: boolean | undefined;
  };
  chains: Chain[];
  address: string;
  disconnect: () => void;
}

const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [bsc.chainId]: bsc,
  [polygon.chainId]: polygon,
  [moonbeam.chainId]: moonbeam,
  [neondevnet.chainId]: neondevnet,
  [chapel.chainId]: chapel,
  [ganache.chainId]: ganache,
};

export const SDKProvider = ({
  children,
  currentChain,
  chains,
  address,
  disconnect,
}: SDKProviderProps) => {
  const sdk = useMemo(() => {
    const config = chainIdToConfig[currentChain.id];

    return new MidasSdk(
      new JsonRpcProvider(config.specificParams.metadata.rpcUrls.default.http[0]),
      config
    );
  }, [currentChain.id]);

  const value = useMemo(() => {
    return {
      sdk,
      address,
      disconnect,
      currentChain,
      chains,
    };
  }, [sdk, address, disconnect, currentChain, chains]);

  return <SDKContext.Provider value={value}>{children}</SDKContext.Provider>;
};

// Hook
export function useSDK() {
  const context = useContext(SDKContext);

  if (context === undefined) {
    throw new Error(`useSDK must be used within a SDKProvider`);
  }

  return context;
}
