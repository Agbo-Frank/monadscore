import { providers } from 'ethers'
import { useMemo } from 'react'
import { monadTestnet } from "wagmi/chains";
import { useConnectorClient } from 'wagmi'

export function clientToSigner(client) {
  const { chain, account, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }

  const provider = new providers.Web3Provider(transport, network)
  const signer = provider.getSigner(account?.address)
  return signer
}

/** Hook to convert a viem Client to an ethers.js Provider. */
export default function useEthersSigner() {
  const { data: client } = useConnectorClient({ chainId: monadTestnet.id || 10143 })
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client])
}