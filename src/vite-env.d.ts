/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_NETWORK?: string;
  readonly VITE_LOCAL_RPC_URL?: string;
  readonly VITE_LOCAL_TOKEN_ADDRESS?: string;
  readonly VITE_LOCAL_MARKETPLACE_ADDRESS?: string;
  readonly VITE_NGO_WALLET?: string;
  readonly VITE_AUDITOR_WALLET?: string;
  readonly VITE_COMPANY_WALLET?: string;
}

// Injected by MetaMask and other EIP-1193 wallets
interface EthereumProvider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  removeListener?(event: string, listener: (...args: unknown[]) => void): void;
}

interface Window {
  ethereum?: EthereumProvider;
}
