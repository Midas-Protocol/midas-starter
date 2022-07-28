import { JsonRpcProvider } from '@ethersproject/providers';
import { Fuse } from '@midas-capital/sdk';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useAccount, useNetwork, useSigner } from 'wagmi';

export const SDKContext = createContext<{ sdk?: Fuse; address?: string } | undefined>(undefined);

export const SDKProvider = ({ children }: { children: ReactNode }) => {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { data: signer } = useSigner();

  const sdk = useMemo(() => {
    if (chain && signer?.provider) {
      return new Fuse(signer.provider as JsonRpcProvider, chain.id);
    }
  }, [chain, signer?.provider]);

  const value = useMemo(() => {
    return {
      sdk,
      address,
    };
  }, [sdk, address]);

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
