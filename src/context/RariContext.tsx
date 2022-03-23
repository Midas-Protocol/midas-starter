// Next
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Button, Link as ChakraLink, useToast } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { Fuse } from '@midas-capital/sdk';
import { useTranslation } from 'next-i18next';
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQueryClient } from 'react-query';
import { useAccount, useConnect, useNetwork, useSigner } from 'wagmi';

import { getScanUrlByChainId } from '@constants/networkData';
import { useColors } from '@hooks/useColors';
import { handleGenericError } from '@utils/errorHandling';
import { initFuseWithProviders } from '@utils/web3Providers';

export interface RariContextData {
  isAuthed: boolean;
  isUnsupported: boolean | undefined;
  fuse: Fuse;
  scanUrl: string | null;
  loading: boolean;
  setLoading: Dispatch<boolean>;
  pendingTxHashes: string[];
  setPendingTxHashes: Dispatch<string[]>;
  pendingTxHash: string;
  setPendingTxHash: Dispatch<string>;
  connectError: Error | undefined;
  connectData: any;
  connect: (connector: any) => Promise<any>;
  disconnect: () => void;
  address: string;
  accountData: any;
  networkData: any;
  switchNetwork: ((chainId: number) => Promise<any>) | undefined;
  accountBtnElement: any;
  networkBtnElement: any;
}

export const EmptyAddress = '0x0000000000000000000000000000000000000000';

export const RariContext = createContext<RariContextData | undefined>(undefined);

export const RariProvider = ({ children }: { children: ReactNode }) => {
  const [{ data: networkData }, switchNetwork] = useNetwork();
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });
  const [{ data: connectData, error: connectError }, connect] = useConnect();

  console.log(connectData);
  console.log(networkData);

  const [{ data: signerData }] = useSigner();

  // Rari and Fuse get initially set already
  const [fuse, setFuse] = useState<Fuse>(() => initFuseWithProviders());
  const [address, setAddress] = useState<string>(EmptyAddress);
  const [chainId, setChainId] = useState<number | undefined>();
  const [scanUrl, setScanUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pendingTxHashes, setPendingTxHashes] = useState<string[]>([]);
  const [pendingTxHash, setPendingTxHash] = useState<string>('');
  const [finishedTxHash, setFinishedTxHash] = useState<string>('');

  const accountBtnElement = useRef();
  const networkBtnElement = useRef();

  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { cPage } = useColors();

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
    if (accountData) {
      setAddress(accountData.address);
    }
  }, [accountData]);

  useEffect(() => {
    if (signerData && signerData.provider) {
      const fuseInstance = initFuseWithProviders(signerData.provider as Web3Provider, chainId);
      mounted.current && setFuse(fuseInstance);
    }
  }, [signerData]);

  useEffect(() => {
    if (networkData && networkData.chain) {
      setChainId(networkData.chain.id);
      setScanUrl(getScanUrlByChainId(networkData.chain.id));
      const id = 'unsupported-network';
      if (networkData.chain?.unsupported) {
        if (!toast.isActive(id)) {
          toast({
            id,
            title: 'Unsupported Network!',
            description: `Supported Networks: ${networkData.chains
              .map((chain) => chain.name)
              .join(', ')}`,
            status: 'warning',
            position: 'bottom-right',
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        toast.close(id);
      }
    }
  }, [networkData, toast]);

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

  const value = useMemo(() => {
    return {
      isAuthed: connectData.connected,
      isUnsupported: networkData.chain?.unsupported,
      connectData,
      connectError,
      connect,
      disconnect,
      accountData,
      networkData,
      fuse,
      address,
      chainId,
      switchNetwork,
      scanUrl,
      loading,
      setLoading,
      pendingTxHash,
      setPendingTxHash,
      pendingTxHashes,
      setPendingTxHashes,
      accountBtnElement,
      networkBtnElement,
    };
  }, [
    connectData,
    connectError,
    connect,
    disconnect,
    accountData,
    networkData,
    fuse,
    address,
    chainId,
    switchNetwork,
    scanUrl,
    loading,
    setLoading,
    pendingTxHash,
    setPendingTxHash,
    pendingTxHashes,
    setPendingTxHashes,
    accountBtnElement,
    networkBtnElement,
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
