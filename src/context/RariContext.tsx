// Next
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Button, Link as ChakraLink, useToast } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { Fuse, SupportedChains } from '@midas-capital/sdk';
import LogRocket from 'logrocket';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  createContext,
  Dispatch,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQueryClient } from 'react-query';

import {
  createAddEthereumChainParams,
  getChainMetadata,
  getScanUrlByChainId,
  getSupportedChains,
  isSupportedChainId,
} from '@constants/networkData';
import { useColors } from '@hooks/useColors';
import { handleGenericError } from '@utils/errorHandling';
import { initFuseWithProviders, providerURLForChain } from '@utils/web3Providers';

async function launchModalLazy(
  t: (text: string, extra?: any) => string,
  cacheProvider = true,
  cCard: any
) {
  const [WalletConnectProvider, Web3Modal] = await Promise.all([
    import('@walletconnect/web3-provider'),
    import('web3modal'),
  ]);

  const providerOptions = {
    injected: {
      display: {
        description: t('Connect with a browser extension'),
      },
      package: null,
    },
    walletconnect: {
      package: WalletConnectProvider.default,
      options: {
        rpc: {
          [SupportedChains.chapel]: providerURLForChain(SupportedChains.chapel),
        },
      },
      display: {
        description: t('Scan with a wallet to connect'),
      },
    },
  };

  if (!cacheProvider) {
    localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');
  }

  const web3Modal = new Web3Modal.default({
    cacheProvider,
    providerOptions,
    theme: {
      background: cCard.bgColor,
      main: cCard.txtColor,
      secondary: cCard.txtColor,
      border: cCard.borderColor,
      hover: cCard.hoverBgColor,
    },
  });

  return web3Modal.connect();
}

export interface RariContextData {
  fuse: Fuse;
  web3ModalProvider: any | null;
  isAuthed: boolean;
  login: (cacheProvider?: boolean) => Promise<any>;
  logout: () => any;
  address: string;
  isAttemptingLogin: boolean;
  chainId: number | undefined;
  switchNetwork: (newChainId: number) => void;
  scanUrl: string | null;
  loading: boolean;
  setLoading: Dispatch<boolean>;
  pendingTxHashes: string[];
  setPendingTxHashes: Dispatch<string[]>;
  pendingTxHash: string;
  setPendingTxHash: Dispatch<string>;
}

export const EmptyAddress = '0x0000000000000000000000000000000000000000';

export const RariContext = createContext<RariContextData | undefined>(undefined);

export const RariProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  // Rari and Fuse get initially set already
  const [fuse, setFuse] = useState<Fuse>(() => initFuseWithProviders());

  const [isAttemptingLogin, setIsAttemptingLogin] = useState<boolean>(false);

  const [address, setAddress] = useState<string>(EmptyAddress);

  const [web3ModalProvider, setWeb3ModalProvider] = useState<any | null>(null);

  const [chainId, setChainId] = useState<number | undefined>();

  const [scanUrl, setScanUrl] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);

  const [pendingTxHashes, setPendingTxHashes] = useState<string[]>([]);

  const [pendingTxHash, setPendingTxHash] = useState<string>('');

  const [finishedTxHash, setFinishedTxHash] = useState<string>('');

  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { cCard, cPage } = useColors();

  const mounted = useRef(false);
  useEffect(() => {
    const pendingStr = localStorage.getItem('pendingTxHashes');
    const pending = pendingStr !== null ? JSON.parse(pendingStr) : [];
    if (pending.length !== 0) {
      pending.map((hash: any) => {
        setPendingTxHash(hash);
      });
    }

    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('pendingTxHashes', JSON.stringify(pendingTxHashes));
  }, [pendingTxHashes]);

  useEffect(() => {
    const pendingFunc = async (hash: string) => {
      try {
        const tx = await fuse.provider.getTransaction(hash);
        if (tx.from === address) {
          toast({
            title: 'Pending!',
            description: 'Transaction is pending now.',
            status: 'info',
            duration: 2000,
            isClosable: true,
            position: 'top-right',
          });
          const res = await tx.wait();
          toast({
            title: 'Complete!',
            description: (
              <Button
                href={`${scanUrl}/tx/${tx.hash}`}
                rightIcon={<ExternalLinkIcon />}
                color={cPage.primary.bgColor}
                variant={'link'}
                as={ChakraLink}
                isExternal
                width="100%"
                py={2}
              >
                View Transaction
              </Button>
            ),
            status: 'success',
            duration: 3000,
            isClosable: true,
            position: 'top-right',
          });
          if (res.blockNumber) {
            mounted.current && setFinishedTxHash(hash);
            await queryClient.refetchQueries();
          }
        }
      } catch (e) {
        handleGenericError(e, toast);
        mounted.current && setFinishedTxHash(hash);
        console.log(e);
      }
    };

    if (pendingTxHash) {
      mounted.current &&
        !pendingTxHashes.includes(pendingTxHash) &&
        setPendingTxHashes([...pendingTxHashes, pendingTxHash]);
      pendingFunc(pendingTxHash);
    }
  }, [pendingTxHash, fuse, address]);

  useEffect(() => {
    if (mounted.current) {
      const updatedTxHashes = [...pendingTxHashes].filter((hash) => {
        return hash !== finishedTxHash;
      });
      setPendingTxHashes(updatedTxHashes);
    }
  }, [finishedTxHash]);

  useEffect(() => {
    mounted.current &&
      Promise.all([fuse.provider.send('net_version', []), fuse.provider.getNetwork()]).then(
        ([, network]) => {
          const { chainId } = network;

          mounted.current && setChainId(chainId);
          mounted.current && setScanUrl(getScanUrlByChainId(chainId));

          if (!isSupportedChainId(chainId) && !toast.isActive('unsupported-network')) {
            toast({
              id: 'unsupported-network',
              title: 'Unsupported Network!',
              description: `Supported Networks: ${getSupportedChains()
                .map((chain) => chain.shortName)
                .join(', ')}`,
              status: 'warning',
              position: 'bottom-right',
              duration: null,
              isClosable: true,
            });
          } else if (isSupportedChainId(chainId) && toast.isActive('unsupported-network')) {
            toast.close('unsupported-network');
          }
        }
      );
  }, [fuse, toast]);

  // We need to give rari the new provider (todo: and also ethers.js signer) every time someone logs in again
  const setRariAndAddressFromModal = useCallback(
    async (modalProvider) => {
      const provider = new Web3Provider(modalProvider);
      const { chainId } = await provider.getNetwork();

      const fuseInstance = initFuseWithProviders(provider, chainId);

      mounted.current && setFuse(fuseInstance);

      fuseInstance.provider.listAccounts().then((addresses: string[]) => {
        if (addresses.length === 0) {
          router.reload();
        }

        const address = addresses[0];
        const requestedAddress = router.query.address as string;

        LogRocket.identify(address);
        mounted.current && setAddress(requestedAddress ?? address);
      });
    },
    [setAddress, router]
  );

  const login = useCallback(
    async (cacheProvider = true) => {
      try {
        mounted.current && setIsAttemptingLogin(true);
        const providerWeb3Modal = await launchModalLazy(t, cacheProvider, cCard);
        mounted.current && setWeb3ModalProvider(providerWeb3Modal);
        mounted.current && setRariAndAddressFromModal(providerWeb3Modal);
        mounted.current && setIsAttemptingLogin(false);
      } catch (err) {
        mounted.current && setIsAttemptingLogin(false);
        return console.error(err);
      }
    },
    [setWeb3ModalProvider, setRariAndAddressFromModal, setIsAttemptingLogin, t, cCard]
  );

  const refetchAccountData = useCallback(() => {
    mounted.current && web3ModalProvider !== null && setRariAndAddressFromModal(web3ModalProvider);

    queryClient.clear();
  }, [setRariAndAddressFromModal, web3ModalProvider, queryClient]);

  const logout = useCallback(() => {
    mounted.current &&
      setWeb3ModalProvider((past: any) => {
        if (past?.off) {
          past.off('accountsChanged', refetchAccountData);
          past.off('chainChanged', refetchAccountData);
        }

        return null;
      });

    localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');

    mounted.current && setAddress(EmptyAddress);
  }, [setWeb3ModalProvider, refetchAccountData]);

  useEffect(() => {
    if (web3ModalProvider !== null && web3ModalProvider.on) {
      web3ModalProvider.on('accountsChanged', refetchAccountData);
      web3ModalProvider.on('chainChanged', refetchAccountData);
    }

    return () => {
      if (web3ModalProvider?.off) {
        web3ModalProvider.off('accountsChanged', refetchAccountData);
        web3ModalProvider.off('chainChanged', refetchAccountData);
      }
    };
  }, [web3ModalProvider, refetchAccountData]);

  // Based on Metamask-recommended code at
  // https://docs.metamask.io/guide/rpc-api.html#usage-with-wallet-switchethereumchain
  // TODO(nathanhleung) handle all possible errors

  const value = useMemo(() => {
    const switchNetwork = async function (chainId: SupportedChains) {
      const hexChainId = chainId.toString(16);
      const chainMetadata = getChainMetadata(chainId);

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${hexChainId}` }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if ((switchError as any).code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: chainMetadata ? [createAddEthereumChainParams(chainMetadata)] : undefined,
            });
          } catch (addError) {
            // handle "add" error
          }
        }
        // handle other "switch" errors
      } finally {
        refetchAccountData();
      }
    };

    return {
      web3ModalProvider,
      fuse,
      isAuthed: address !== EmptyAddress,
      login,
      logout,
      address,
      isAttemptingLogin,
      chainId,
      switchNetwork,
      scanUrl,
      loading,
      setLoading,
      pendingTxHash,
      setPendingTxHash,
      pendingTxHashes,
      setPendingTxHashes,
    };
  }, [
    web3ModalProvider,
    login,
    logout,
    address,
    fuse,
    isAttemptingLogin,
    chainId,
    refetchAccountData,
    scanUrl,
    loading,
    setLoading,
    pendingTxHash,
    setPendingTxHash,
    pendingTxHashes,
    setPendingTxHashes,
  ]);

  return <RariContext.Provider value={value}>{children}</RariContext.Provider>;
};

// Hook
export function useRari() {
  const context = useContext(RariContext);

  if (context === undefined) {
    throw new Error(`useRari must be used within a RariProvider`);
  }

  return context;
}
