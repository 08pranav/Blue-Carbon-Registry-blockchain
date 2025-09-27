import React from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

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