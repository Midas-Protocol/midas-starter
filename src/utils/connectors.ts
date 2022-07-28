import { Chain, configureChains } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const supportedChains: Chain[] = [
  {
    id: 97,
    name: 'BSC Testnet (Chapel)',
    network: 'BSC Testnet (Chapel)',
    nativeCurrency: {
      name: 'BSC',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: { default: 'https://data-seed-prebsc-1-s1.binance.org:8545/' },
    blockExplorers: { default: { name: 'BscScan(Testnet)', url: 'https://testnet.bscscan.com' } },
    testnet: true,
  },
];

export const { chains, provider } = configureChains(supportedChains, [
  jsonRpcProvider({
    rpc: (chain) => {
      return { http: chain.rpcUrls.default };
    },
  }),
]);

export const connectors = () => {
  return [
    new InjectedConnector({
      chains,
      options: { shimChainChangedDisconnect: true, shimDisconnect: false },
    }),
  ];
};
