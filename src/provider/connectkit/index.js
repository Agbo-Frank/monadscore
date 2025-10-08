import { WagmiProvider, createConfig, fallback, http } from "wagmi";
import { monadTestnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { createStorage } from "wagmi";

const config = createConfig(
  getDefaultConfig({
    // Your dApp's chains
    chains: [monadTestnet],
    enableFamily: false,
    transports: {
      // RPC URL for each chain
      [monadTestnet.id]: fallback([
        http("https://testnet-rpc.monad.xyz", { timeout: 10_000 }),
        http("https://rpc.ankr.com/monad_testnet", { timeout: 10_000 }),
        http("https://monad-testnet.drpc.org", { timeout: 10_000 })
      ])
    },

    // Storage configuration for connection persistence
    storage: createStorage({
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    }),

    // Required API Keys

    // Required App Info
    appName: "MonadScore",

    // Optional App Info
    appDescription: "The premier DEX aggregator and DeFi platform on Monad Network",
    appUrl: "https://monadscore.com", // your app's url
    appIcon: "/monadscore.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
);

// Create QueryClient with proper persistence and retry configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const Web3Provider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="midnight"
          mode="dark"
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};