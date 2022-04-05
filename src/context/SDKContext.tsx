import { Fuse } from '@midas-capital/sdk';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useAccount, useNetwork, useSigner } from 'wagmi';

export const SDKContext = createContext<{ sdk?: Fuse; account?: string } | undefined>(undefined);

export const SDKProvider = ({ children }: { children: ReactNode }) => {
  const [{ data: networkData }] = useNetwork();
  const [{ data: accountData }] = useAccount();
  const [{ data: signerData }] = useSigner();

  const sdk = useMemo(() => {
    if (networkData.chain && signerData?.provider) {
      return new Fuse(signerData.provider as JsonRpcProvider, networkData.chain.id);
    }
  }, [networkData.chain, signerData?.provider]);

  const value = useMemo(() => {
    return {
      sdk,
      account: accountData?.address,
    };
  }, [sdk, accountData]);

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
