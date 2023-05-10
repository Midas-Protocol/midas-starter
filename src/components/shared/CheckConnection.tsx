import { Text } from '@chakra-ui/react';
import { ReactNode, useEffect, useState } from 'react';
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork, useWalletClient } from 'wagmi';

import { SDKProvider } from '@context/SDKContext';

const CheckConnection = ({ children }: { children: ReactNode }) => {
  const { chain, chains } = useNetwork();
  const { isLoading: isNetworkLoading } = useSwitchNetwork();
  const { data: walletClient } = useWalletClient();
  const { address, isConnecting, isReconnecting, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [signerChainId, setSignerChainId] = useState<number | undefined>();

  useEffect(() => {
    const func = async () => {
      if (typeof walletClient?.getChainId === 'function') {
        const _signerChainId = await walletClient.getChainId();
        setSignerChainId(_signerChainId);
      }
    };

    func();
  }, [walletClient]);

  if (isConnecting || isReconnecting || isNetworkLoading) {
    return <Text>Loading...</Text>;
  }
  // Not Connected
  else if (!isConnected && !isConnecting && !isReconnecting) {
    return <Text>Not Connected</Text>;
  } // Wrong Network
  else if (!chain || chain.unsupported) {
    return <Text>Wrong Network</Text>;
  }

  // Everything Fine
  else if (chain && address && signerChainId === chain.id) {
    return (
      <SDKProvider currentChain={chain} chains={chains} address={address} disconnect={disconnect}>
        {children}
      </SDKProvider>
    );
    // !accountData?.address || !signerData?.provider
  } else {
    return null;
  }
};

export default CheckConnection;
