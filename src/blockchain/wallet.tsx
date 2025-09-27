import React from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://rpc.sepolia.org'

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected({
      target: 'metaMask',
    }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
})

export function Web3Provider({ children }: { readonly children: React.ReactNode }) {
  return <WagmiProvider config={config}>{children}</WagmiProvider>
}