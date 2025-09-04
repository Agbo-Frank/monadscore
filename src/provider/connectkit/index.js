import { WagmiProvider, createConfig, fallback, http } from "wagmi";
import { monadTestnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
  getDefaultConfig({
    chains: [monadTestnet],
    enableFamily: false,
    transports: {
      [monadTestnet.id]: fallback([
        http("https://testnet-rpc.monad.xyz"),
        http("https://rpc.ankr.com/monad_testnet"),
        http("https://monad-testnet.drpc.org")
      ])
    },
    walletConnectProjectId: "74e1301866e68d5be6c0fe14ba83511f",
    appName: "Monadscore"
  }),
);

const queryClient = new QueryClient();

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