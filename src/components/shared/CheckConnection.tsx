import { ReactNode, useEffect, useState } from 'react';
import { useAccount, useDisconnect, useNetwork, useSigner, useSwitchNetwork } from 'wagmi';

import { SDKProvider } from '@context/SDKContext';

const CheckConnection = ({ children }: { children: ReactNode }) => {
  const { chain, chains } = useNetwork();
  const { isLoading: isNetworkLoading } = useSwitchNetwork();
  const { data: signerData } = useSigner();
  const { address, isConnecting, isReconnecting, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [signerChainId, setSignerChainId] = useState<number | undefined>();

  useEffect(() => {
    const func = async () => {
      if (typeof signerData?.getChainId === 'function') {
        const _signerChainId = await signerData.getChainId();
        setSignerChainId(_signerChainId);
      }
    };

    func();
  }, [signerData]);

  if (isConnecting || isReconnecting || isNetworkLoading) {
    return <>Loading...</>;
  }
  // Not Connected
  else if (!isConnected && !isConnecting && !isReconnecting) {
    return <>Not Connected</>;
  } // Wrong Network
  else if (!chain || chain.unsupported) {
    return <>Wrong Network</>;
  }

  // Everything Fine
  else if (chain && address && signerData?.provider && signerChainId === chain.id) {
    return (
      <SDKProvider
        currentChain={chain}
        chains={chains}
        signerProvider={signerData.provider}
        address={address}
        disconnect={disconnect}
      >
        {children}
      </SDKProvider>
    );
    // !accountData?.address || !signerData?.provider
  } else {
    return null;
  }
};

export default CheckConnection;
