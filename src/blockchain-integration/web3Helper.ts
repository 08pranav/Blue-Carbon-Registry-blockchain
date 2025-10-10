import { ethers } from 'ethers';
import { BLOCKCHAIN_CONFIG } from './config';
import { FIXED_WALLETS, validateWalletForRole } from '../utils/fixedWallets.js';

declare global {
  interface Window {
    ethereum: any;
  }
}

export class Web3Helper {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private tokenContract: ethers.Contract | null = null;
  private marketplaceContract: ethers.Contract | null = null;

  /**
   * Connect to MetaMask wallet
   */
  async connectWallet(): Promise<{ address: string; balance: string }> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed! Please install MetaMask.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your MetaMask wallet.');
      }

      // Initialize provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Get user's address and balance
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);

      // Initialize contracts
      this.initializeContracts();

      // Switch to Sepolia if needed
      await this.switchToSepolia();

      return {
        address,
        balance: ethers.formatEther(balance),
      };
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      throw new Error(`Wallet connection failed: ${error.message}`);
    }
  }

  /**
   * Switch to Sepolia testnet
   */
  async switchToSepolia(): Promise<void> {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
      });
    } catch (switchError: any) {
      // If Sepolia is not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Testnet',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
      }
    }
  }

  /**
   * Initialize smart contracts
   */
  private initializeContracts(): void {
    if (!this.signer) return;

    this.tokenContract = new ethers.Contract(
      BLOCKCHAIN_CONFIG.TOKEN_ADDRESS,
      BLOCKCHAIN_CONFIG.TOKEN_ABI,
      this.signer
    );

    this.marketplaceContract = new ethers.Contract(
      BLOCKCHAIN_CONFIG.MARKETPLACE_ADDRESS,
      BLOCKCHAIN_CONFIG.MARKETPLACE_ABI,
      this.signer
    );
  }

  /**
   * Get current user's address
   */
  async getCurrentAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    return await this.signer.getAddress();
  }

  /**
   * Get BCC token balance for an address
   */
  async getBCCBalance(address?: string): Promise<string> {
    if (!this.tokenContract) {
      throw new Error('Contracts not initialized');
    }

    const targetAddress = address || await this.getCurrentAddress();
    const balance = await this.tokenContract.balanceOf(targetAddress);
    return ethers.formatEther(balance);
  }

  /**
   * Get ETH balance for an address
   */
  async getETHBalance(address?: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const targetAddress = address || await this.getCurrentAddress();
    const balance = await this.provider.getBalance(targetAddress);
    return ethers.formatEther(balance);
  }

  // ==================== NGO FUNCTIONS ====================

  /**
   * Register NGO on blockchain
   */
  async registerNGO(name: string, documentsHash: string): Promise<{ txHash: string; ngoId: number }> {
    if (!this.marketplaceContract) {
      throw new Error('Contracts not initialized');
    }

    try {
      const address = await this.getCurrentAddress();
      const tx = await this.marketplaceContract.registerNGO(address, name, documentsHash);
      const receipt = await tx.wait();

      // Find NGORegistered event to get the NGO ID
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.marketplaceContract!.interface.parseLog(log);
          return parsed?.name === 'NGORegistered';
        } catch {
          return false;
        }
      });

      const ngoId = event ? Number(event.args[0]) : 0;

      return {
        txHash: tx.hash,
        ngoId
      };
    } catch (error: any) {
      console.error('NGO registration failed:', error);
      throw new Error(`NGO registration failed: ${error.message}`);
    }
  }

  /**
   * Get NGO details by ID
   */
  async getNGOById(ngoId: number): Promise<any> {
    if (!this.marketplaceContract) {
      throw new Error('Contracts not initialized');
    }

    return await this.marketplaceContract.getNgoById(ngoId);
  }

  // ==================== ADMIN FUNCTIONS ====================

  /**
   * Admin: Verify NGO and allocate credits
   */
  async verifyNGOAndAllocateCredits(
    ngoId: number,
    status: number, // 2 = Verified, 3 = Rejected
    creditsToAllocate: number
  ): Promise<string> {
    if (!this.marketplaceContract) {
      throw new Error('Contracts not initialized');
    }

    try {
      const tx = await this.marketplaceContract.verifyNGO(ngoId, status, creditsToAllocate);
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      console.error('NGO verification failed:', error);
      throw new Error(`NGO verification failed: ${error.message}`);
    }
  }

  /**
   * Admin: Mint additional credits directly
   */
  async mintCredits(toAddress: string, amount: number): Promise<string> {
    if (!this.tokenContract) {
      throw new Error('Contracts not initialized');
    }

    try {
      const amountWei = ethers.parseEther(amount.toString());
      const tx = await this.tokenContract.mint(toAddress, amountWei);
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      console.error('Credit minting failed:', error);
      throw new Error(`Credit minting failed: ${error.message}`);
    }
  }

  // ==================== COMPANY FUNCTIONS ====================

  /**
   * Register Company on blockchain
   */
  async registerCompany(name: string, kycHash: string): Promise<{ txHash: string; companyId: number }> {
    if (!this.marketplaceContract) {
      throw new Error('Contracts not initialized');
    }

    try {
      const address = await this.getCurrentAddress();
      const tx = await this.marketplaceContract.registerCompany(address, name, kycHash);
      const receipt = await tx.wait();

      // Find CompanyRegistered event to get the Company ID
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.marketplaceContract!.interface.parseLog(log);
          return parsed?.name === 'CompanyRegistered';
        } catch {
          return false;
        }
      });

      const companyId = event ? Number(event.args[0]) : 0;

      return {
        txHash: tx.hash,
        companyId
      };
    } catch (error: any) {
      console.error('Company registration failed:', error);
      throw new Error(`Company registration failed: ${error.message}`);
    }
  }

  /**
   * Get Company details by ID
   */
  async getCompanyById(companyId: number): Promise<any> {
    if (!this.marketplaceContract) {
      throw new Error('Contracts not initialized');
    }

    return await this.marketplaceContract.getCompanyById(companyId);
  }

  // ==================== TRADING FUNCTIONS ====================

  /**
   * Company: Buy credits from NGO
   */
  async buyCredits(
    sellerAddress: string,
    amount: number,
    priceInETH: number,
    pdfHash: string
  ): Promise<string> {
    if (!this.marketplaceContract) {
      throw new Error('Contracts not initialized');
    }

    try {
      const buyerAddress = await this.getCurrentAddress();
      const amountWei = ethers.parseEther(amount.toString());
      const priceWei = ethers.parseEther(priceInETH.toString());

      // First, approve the marketplace to transfer tokens from seller
      // Note: This should be done by the seller in the frontend
      
      const tx = await this.marketplaceContract.executeTrade(
        sellerAddress,
        buyerAddress,
        amountWei,
        pdfHash,
        { value: priceWei }
      );
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      console.error('Credit purchase failed:', error);
      throw new Error(`Credit purchase failed: ${error.message}`);
    }
  }

  /**
   * NGO: Approve marketplace to transfer credits
   */
  async approveCreditsForSale(amount: number): Promise<string> {
    if (!this.tokenContract) {
      throw new Error('Contracts not initialized');
    }

    try {
      const amountWei = ethers.parseEther(amount.toString());
      const tx = await this.tokenContract.approve(
        BLOCKCHAIN_CONFIG.MARKETPLACE_ADDRESS,
        amountWei
      );
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      console.error('Credit approval failed:', error);
      throw new Error(`Credit approval failed: ${error.message}`);
    }
  }

  /**
   * Get trade details by ID
   */
  async getTradeById(tradeId: number): Promise<any> {
    if (!this.marketplaceContract) {
      throw new Error('Contracts not initialized');
    }

    return await this.marketplaceContract.getTradeById(tradeId);
  }

  // ==================== EVENT LISTENERS ====================

  /**
   * Listen for NGO registration events
   */
  onNGORegistered(callback: (ngoId: number, wallet: string, name: string) => void): void {
    if (!this.marketplaceContract) return;

    this.marketplaceContract.on('NGORegistered', (ngoId, wallet, name) => {
      callback(Number(ngoId), wallet, name);
    });
  }

  /**
   * Listen for NGO verification events
   */
  onNGOStatusUpdated(callback: (ngoId: number, status: number, timestamp: number) => void): void {
    if (!this.marketplaceContract) return;

    this.marketplaceContract.on('NGOStatusUpdated', (ngoId, status, timestamp) => {
      callback(Number(ngoId), Number(status), Number(timestamp));
    });
  }

  /**
   * Listen for credit minting events
   */
  onCreditsMinted(callback: (ngoId: number, to: string, amount: string) => void): void {
    if (!this.marketplaceContract) return;

    this.marketplaceContract.on('CreditsMinted', (ngoId, to, amount) => {
      callback(Number(ngoId), to, ethers.formatEther(amount));
    });
  }

  /**
   * Listen for trade execution events
   */
  onTradeExecuted(callback: (tradeId: number, seller: string, buyer: string, amount: string, price: string, pdfHash: string) => void): void {
    if (!this.marketplaceContract) return;

    this.marketplaceContract.on('TradeExecuted', (tradeId, seller, buyer, amount, price, pdfHash) => {
      callback(
        Number(tradeId),
        seller,
        buyer,
        ethers.formatEther(amount),
        ethers.formatEther(price),
        pdfHash
      );
    });
  }

  /**
   * Cleanup event listeners
   */
  removeAllListeners(): void {
    if (this.marketplaceContract) {
      this.marketplaceContract.removeAllListeners();
    }
    if (this.tokenContract) {
      this.tokenContract.removeAllListeners();
    }
  }
}

export const web3Helper = new Web3Helper();