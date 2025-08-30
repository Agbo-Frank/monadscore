// thirdwebClient.ts
import { createThirdwebClient } from "thirdweb";
import { monadTestnet } from "thirdweb/chains";

const client = createThirdwebClient({
  clientId: "13b751a9c3cb333cd2c8050173259f0b"
});

export const chain = { ...monadTestnet, rpc: "https://testnet-rpc.monad.xyz" }

export default client
