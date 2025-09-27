import React from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { sepolia, mainnet, polygon } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

import { blockchainConfig } from '@/lib/config'

// Environment variables for blockchain configuration
const rpcUrl = blockchainConfig.rpcUrl
const projectId = blockchainConfig.walletConnectProjectId || 'demo-project-id'

// Configure supported chains
const supportedChains = [sepolia, polygon]
// Add mainnet only in production
if (import.meta.env.PROD) {
  supportedChains.push(mainnet)
}

export const config = createConfig({
  chains: supportedChains,
  connectors: [
    injected({
      target: 'metaMask',
    }),
    walletConnect({
      projectId,
    }),
  ],
  transports: {
    [sepolia.id]: http(rpcUrl),
    [polygon.id]: http(),
    ...(import.meta.env.PROD && {
      [mainnet.id]: http(),
    }),
  },
})

export function Web3Provider({ children }: { readonly children: React.ReactNode }) {
  return <WagmiProvider config={config}>{children}</WagmiProvider>
}