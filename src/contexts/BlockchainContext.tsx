import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { web3Helper, type NgoRecord } from '../blockchain-integration/utils/web3Helper';
import { getCurrentNetworkConfig } from '../blockchain-integration/config';
import { errorMessage } from '@/lib/errors';
import { toast } from 'sonner';

interface BlockchainContextType {
  isConnected: boolean;
  walletAddress: string | null;
  ethBalance: string;
  tokenBalance: string;
  networkInfo: ReturnType<typeof getCurrentNetworkConfig> | null;
  connecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalances: (address?: string | null) => Promise<void>;
  registerNGO: (name: string, documentsHash: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  registerCompany: (name: string, kycHash: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  verifyNGO: (ngoId: string, approved: boolean, creditsToAllocate?: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  executeTrade: (sellerAddress: string, amount: string, price: string, pdfHash: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  getNGOByWallet: (walletAddress: string) => Promise<NgoRecord | null>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

interface BlockchainProviderProps {
  children: ReactNode;
}

export const BlockchainProvider: React.FC<BlockchainProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [networkInfo, setNetworkInfo] = useState<ReturnType<typeof getCurrentNetworkConfig> | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Initialize blockchain connection on mount
  useEffect(() => {
    checkExistingConnection();
    setupEventListeners();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  // Check if wallet is already connected
  const checkExistingConnection = async () => {
    try {
      const address = await web3Helper.getCurrentAccount();
      if (address && web3Helper.isConnected()) {
        setWalletAddress(address);
        setIsConnected(true);
        setNetworkInfo(web3Helper.getNetworkInfo());
        await refreshBalances(address);
      }
    } catch (error) {
      console.error('Error checking existing connection:', error);
    }
  };

  // Setup MetaMask event listeners
  const setupEventListeners = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      // Account changed
      window.ethereum.on?.('accountsChanged', (...args: unknown[]) => {
        const accounts = args[0] as string[];
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWalletAddress(accounts[0]);
          refreshBalances(accounts[0]);
        }
      });

      // Chain changed
      window.ethereum.on?.('chainChanged', () => {
        // Reload the page to reset state
        window.location.reload();
      });
    }
  };

  // Connect to wallet
  const connectWallet = async () => {
    setConnecting(true);
    try {
      const result = await web3Helper.connectWallet();
      
      if (result.success && result.address) {
        setIsConnected(true);
        setWalletAddress(result.address);
        setNetworkInfo(web3Helper.getNetworkInfo());
        await refreshBalances(result.address);
        toast.success('Wallet connected successfully!');
      } else {
        toast.error(result.error || 'Failed to connect wallet');
      }
    } catch (error) {
      console.error('Connect wallet error:', error);
      toast.error(errorMessage(error) || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    web3Helper.disconnect();
    setIsConnected(false);
    setWalletAddress(null);
    setEthBalance('0');
    setTokenBalance('0');
    setNetworkInfo(null);
    toast.info('Wallet disconnected');
  };

  // Refresh balances
  const refreshBalances = async (address: string | null = walletAddress) => {
    if (!address) return;

    try {
      const [ethBal, tokenBal] = await Promise.all([
        web3Helper.getEthBalance(address),
        web3Helper.getTokenBalance(address)
      ]);
      
      setEthBalance(ethBal);
      setTokenBalance(tokenBal);
    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
  };

  // Register NGO
  const registerNGO = async (name: string, documentsHash: string) => {
    try {
      const result = await web3Helper.registerNGO(name, documentsHash);
      if (result.success) {
        toast.success('NGO registration submitted to blockchain!');
        await refreshBalances();
      } else {
        toast.error(result.error || 'Failed to register NGO');
      }
      return result;
    } catch (error) {
      let errorMsg = errorMessage(error) || 'Failed to register NGO';
      
      // Handle specific "already registered" error
      if (errorMsg.includes('already registered')) {
        errorMsg = 'NGO is already registered on the blockchain. You can proceed with normal operations.';
        toast.info(errorMsg);
        return { success: true, error: errorMsg };
      }
      
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Register Company  
  const registerCompany = async (name: string, kycHash: string) => {
    try {
      const result = await web3Helper.registerCompany(name, kycHash);
      if (result.success) {
        toast.success('Company registration submitted to blockchain!');
        await refreshBalances();
      } else {
        toast.error(result.error || 'Failed to register company');
      }
      return result;
    } catch (error) {
      const errorMsg = errorMessage(error) || 'Failed to register company';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Verify NGO (Admin only)
  const verifyNGO = async (ngoId: string, approved: boolean, creditsToAllocate: string = "0") => {
    try {
      const result = await web3Helper.verifyNGO(ngoId, approved, creditsToAllocate);
      if (result.success) {
        toast.success(`NGO ${approved ? 'verified' : 'rejected'} successfully!`);
        await refreshBalances();
      } else {
        toast.error(result.error || 'Failed to verify NGO');
      }
      return result;
    } catch (error) {
      const errorMsg = errorMessage(error) || 'Failed to verify NGO';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Execute Trade
  const executeTrade = async (sellerAddress: string, amount: string, price: string, pdfHash: string) => {
    try {
      const result = await web3Helper.executeTrade(sellerAddress, amount, price, pdfHash);
      if (result.success) {
        toast.success('Trade executed successfully!');
        await refreshBalances();
      } else {
        toast.error(result.error || 'Failed to execute trade');
      }
      return result;
    } catch (error) {
      const errorMsg = errorMessage(error) || 'Failed to execute trade';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Get NGO by wallet
  const getNGOByWallet = async (walletAddress: string) => {
    try {
      return await web3Helper.getNGOByWallet(walletAddress);
    } catch (error) {
      console.error('Error getting NGO:', error);
      throw error;
    }
  };

  const value: BlockchainContextType = {
    isConnected,
    walletAddress,
    ethBalance,
    tokenBalance,
    networkInfo,
    connecting,
    connectWallet,
    disconnectWallet,
    refreshBalances,
    registerNGO,
    registerCompany,
    verifyNGO,
    executeTrade,
    getNGOByWallet
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = (): BlockchainContextType => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};