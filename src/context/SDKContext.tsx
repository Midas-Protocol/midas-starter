import { Provider, Web3Provider } from '@ethersproject/providers';
import { Fuse } from '@midas-capital/sdk';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { Chain } from 'wagmi';

export interface SDKContextData {
  sdk: Fuse;
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
  signerProvider: Provider;
  address: string;
  disconnect: () => void;
}

export const SDKProvider = ({
  children,
  currentChain,
  chains,
  signerProvider,
  address,
  disconnect,
}: SDKProviderProps) => {
  const sdk = useMemo(() => {
    return new Fuse(signerProvider as Web3Provider, currentChain.id);
  }, [signerProvider, currentChain.id]);

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
