import { BrowserProvider, Contract, JsonRpcSigner, parseEther, formatEther } from 'ethers';
import { errorCode, errorMessage } from '@/lib/errors';
import { BLOCKCHAIN_CONFIG, getCurrentNetworkConfig, getCurrentContractAddresses } from '../config';
import CarbonCreditTokenABI from '../abi/CarbonCreditToken.json';
import MarketplaceABI from '../abi/Marketplace.json';

export interface NgoRecord {
  ngoId: string;
  wallet: string;
  name: string;
  status: number;
  documentsHash: string;
  creditsAllocated: string;
  dateVerified: string;
}

export class Web3Helper {
  private provider: BrowserProvider | null = null;
  private signer: JsonRpcSigner | null = null;
  private tokenContract: Contract | null = null;
  private marketplaceContract: Contract | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new BrowserProvider(window.ethereum);
    }
  }

  // Connect to MetaMask
  async connectWallet(): Promise<{ success: boolean; address?: string; error?: string }> {
    try {
      if (!window.ethereum) {
        return { success: false, error: 'MetaMask not installed' };
      }

      // Request account access
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts'
      })) as string[];

      if (accounts.length === 0) {
        return { success: false, error: 'No accounts found' };
      }

      // Switch to the correct network
      await this.switchToCorrectNetwork();

      // Initialize provider and signer
      this.provider = new BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Initialize contracts
      await this.initializeContracts();

      return { success: true, address: accounts[0] };
    } catch (error) {
      console.error('Wallet connection error:', error);
      return { success: false, error: errorMessage(error) };
    }
  }

  // Switch to the correct network (Sepolia)
  async switchToCorrectNetwork(): Promise<void> {
    const networkConfig = getCurrentNetworkConfig();
    
    if (!window.ethereum) throw new Error('MetaMask not installed');
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainIdHex }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (errorCode(switchError) === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: networkConfig.chainIdHex,
              chainName: networkConfig.chainName,
              rpcUrls: networkConfig.rpcUrls,
              blockExplorerUrls: networkConfig.blockExplorerUrls,
              nativeCurrency: networkConfig.nativeCurrency,
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  // Initialize smart contracts
  private async initializeContracts(): Promise<void> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    const addresses = getCurrentContractAddresses();
    
    if (!addresses.CARBON_CREDIT_TOKEN || !addresses.MARKETPLACE) {
      throw new Error('Contract addresses not configured for current network');
    }

    this.tokenContract = new Contract(
      addresses.CARBON_CREDIT_TOKEN,
      CarbonCreditTokenABI.abi,
      this.signer
    );

    this.marketplaceContract = new Contract(
      addresses.MARKETPLACE,
      MarketplaceABI.abi, 
      this.signer
    );
  }

  // Get current account
  async getCurrentAccount(): Promise<string | null> {
    try {
      if (!this.provider) return null;
      const accounts = await this.provider.listAccounts();
      return accounts.length > 0 ? accounts[0].address : null;
    } catch (error) {
      console.error('Error getting current account:', error);
      return null;
    }
  }

  // Get token balance
  async getTokenBalance(address: string): Promise<string> {
    try {
      if (!this.tokenContract) {
        throw new Error('Token contract not initialized');
      }
      const balance = await this.tokenContract.balanceOf(address);
      return formatEther(balance);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw error;
    }
  }

  // Get ETH balance
  async getEthBalance(address: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }
      const balance = await this.provider.getBalance(address);
      return formatEther(balance);
    } catch (error) {
      console.error('Error getting ETH balance:', error);
      throw error;
    }
  }

  // Register NGO
  async registerNGO(name: string, documentsHash: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.marketplaceContract || !this.signer) {
        throw new Error('Contracts not initialized');
      }

      const walletAddress = await this.signer.getAddress();
      const tx = await this.marketplaceContract.registerNGO(walletAddress, name, documentsHash);
      await tx.wait();

      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Error registering NGO:', error);
      return { success: false, error: errorMessage(error) };
    }
  }

  // Get NGO by wallet address
  async getNGOByWallet(walletAddress: string): Promise<NgoRecord | null> {
    try {
      if (!this.marketplaceContract) {
        throw new Error('Marketplace contract not initialized');
      }

      const ngoId = await this.marketplaceContract.ngoIdByWallet(walletAddress);
      if (ngoId.toString() === '0') {
        return null; // NGO not registered
      }

      const ngo = await this.marketplaceContract.ngos(ngoId);
      return {
        ngoId: ngo.ngoId.toString(),
        wallet: ngo.wallet,
        name: ngo.name,
        status: ngo.status,
        documentsHash: ngo.documentsHash,
        creditsAllocated: formatEther(ngo.creditsAllocated),
        dateVerified: ngo.dateVerified.toString()
      };
    } catch (error) {
      console.error('Error getting NGO:', error);
      throw error;
    }
  }

  // Verify NGO (Admin only)
  async verifyNGO(ngoId: string, approved: boolean, creditsToAllocate: string = "0"): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.marketplaceContract) {
        throw new Error('Marketplace contract not initialized');
      }

      const status = approved ? 2 : 3; // 2 = Verified, 3 = Rejected
      const credits = parseEther(creditsToAllocate);
      
      const tx = await this.marketplaceContract.verifyNGO(ngoId, status, credits);
      await tx.wait();

      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Error verifying NGO:', error);
      return { success: false, error: errorMessage(error) };
    }
  }

  // Register Company
  async registerCompany(name: string, kycHash: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.marketplaceContract || !this.signer) {
        throw new Error('Contracts not initialized');
      }

      const walletAddress = await this.signer.getAddress();
      const tx = await this.marketplaceContract.registerCompany(walletAddress, name, kycHash);
      await tx.wait();

      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Error registering company:', error);
      return { success: false, error: errorMessage(error) };
    }
  }

  // Execute Trade
  async executeTrade(
    sellerAddress: string,
    amount: string,
    price: string,
    pdfHash: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.marketplaceContract || !this.signer) {
        throw new Error('Contracts not initialized');
      }

      const buyerAddress = await this.signer.getAddress();
      const amountWei = parseEther(amount);
      const priceWei = parseEther(price);

      // executeTrade(seller, buyer, amount, pdfHash) payable: the ETH goes to the seller
      const tx = await this.marketplaceContract.executeTrade(
        sellerAddress,
        buyerAddress,
        amountWei,
        pdfHash,
        { value: priceWei }
      );
      await tx.wait();

      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Error executing trade:', error);
      return { success: false, error: errorMessage(error) };
    }
  }

  // Get Network Info
  getNetworkInfo() {
    return getCurrentNetworkConfig();
  }

  // Get Contract Addresses
  getContractAddresses() {
    return getCurrentContractAddresses();
  }

  // Check if wallet is connected
  isConnected(): boolean {
    return this.signer !== null;
  }

  // Disconnect wallet
  disconnect(): void {
    this.provider = null;
    this.signer = null;  
    this.tokenContract = null;
    this.marketplaceContract = null;
  }
}

// Singleton instance
export const web3Helper = new Web3Helper();