import { ethers } from 'ethers';
import { BLOCKCHAIN_CONFIG } from '../blockchain-integration/config';
import { FIXED_WALLETS } from './fixedWallets.js';

export class TokenTransferService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private tokenContract: ethers.Contract | null = null;

  async initialize() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed! Please install MetaMask to use blockchain features.');
    }

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    
    const connectedAddress = await this.signer.getAddress();
    const network = await this.provider.getNetwork();
    
    console.log('🔗 Connected to:', connectedAddress);
    console.log('🌐 Network:', network.name, `(${network.chainId})`);
    
    // Ensure we're on Sepolia testnet
    if (network.chainId !== BigInt(BLOCKCHAIN_CONFIG.NETWORK_CONFIG.chainId)) {
      console.log('🔄 Switching to Sepolia testnet...');
      await this.switchToSepolia();
    }
    
    this.tokenContract = new ethers.Contract(
      BLOCKCHAIN_CONFIG.TOKEN_ADDRESS,
      BLOCKCHAIN_CONFIG.TOKEN_ABI,
      this.signer
    );

    // Verify contract is working
    try {
      const name = await this.tokenContract.name();
      const symbol = await this.tokenContract.symbol();
      console.log(`✅ Contract verified: ${name} (${symbol}) at ${BLOCKCHAIN_CONFIG.TOKEN_ADDRESS}`);
    } catch (error) {
      console.error('❌ Contract verification failed:', error);
      throw new Error(`Contract not accessible: ${error.message}`);
    }
  }

  async switchToSepolia() {
    try {
      // Try to switch to Sepolia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BLOCKCHAIN_CONFIG.NETWORK_CONFIG.chainIdHex }],
      });
    } catch (switchError: any) {
      // If Sepolia is not added to MetaMask, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: BLOCKCHAIN_CONFIG.NETWORK_CONFIG.chainIdHex,
              chainName: BLOCKCHAIN_CONFIG.NETWORK_CONFIG.chainName,
              nativeCurrency: BLOCKCHAIN_CONFIG.NETWORK_CONFIG.nativeCurrency,
              rpcUrls: BLOCKCHAIN_CONFIG.NETWORK_CONFIG.rpcUrls,
              blockExplorerUrls: BLOCKCHAIN_CONFIG.NETWORK_CONFIG.blockExplorerUrls,
            }],
          });
        } catch (addError) {
          throw new Error('Failed to add Sepolia network to MetaMask');
        }
      } else {
        throw new Error('Failed to switch to Sepolia network');
      }
    }
  }

  async verifyContract() {
    try {
      const code = await this.provider!.getCode(BLOCKCHAIN_CONFIG.TOKEN_ADDRESS);
      if (code === '0x') {
        throw new Error(`❌ Contract not deployed at address: ${BLOCKCHAIN_CONFIG.TOKEN_ADDRESS}\n\nThis usually means:\n• Contract hasn't been deployed to Sepolia testnet\n• Wrong contract address in config\n• Not connected to the right network`);
      }
      
      // Try to call a view function to verify contract works
      const name = await this.tokenContract!.name();
      console.log(`✅ Contract verified: ${name} at ${BLOCKCHAIN_CONFIG.TOKEN_ADDRESS}`);
      
      // Minting is done through Marketplace.verifyNGO(); the Marketplace must own the token.
      const owner = await this.tokenContract!.owner();
      if (owner.toLowerCase() !== BLOCKCHAIN_CONFIG.MARKETPLACE_ADDRESS.toLowerCase()) {
        console.warn(`Token owner is ${owner}, not the Marketplace: issuing credits will fail.`);
      }

    } catch (error: any) {
      console.error('Contract verification failed:', error);
      throw new Error(`Contract verification failed: ${error.message}`);
    }
  }

  /**
   * Issue BCC to an NGO when the auditor approves a project.
   *
   * The Marketplace contract owns the token, so the only way to mint is
   * Marketplace.verifyNGO(ngoId, Verified, amount), which only the Marketplace admin
   * (the auditor wallet) may call. If the NGO has no on-chain record yet, the auditor
   * registers it first (registerNGO is open to anyone).
   */
  async mintCreditsToNGO(ngoAddress: string, creditAmount: number, auditorAddress: string, ngoName = 'NGO'): Promise<{
    success: boolean;
    txHash?: string;
    registerTxHash?: string;
    error?: string;
    ngoWallet?: string;
    auditorWallet?: string;
  }> {
    try {
      await this.initialize();

      const connectedAddress = await this.signer!.getAddress();
      if (connectedAddress.toLowerCase() !== auditorAddress.toLowerCase()) {
        throw new Error(`Wrong wallet connected. Please connect the auditor wallet: ${auditorAddress}`);
      }

      const marketplace = new ethers.Contract(
        BLOCKCHAIN_CONFIG.MARKETPLACE_ADDRESS,
        BLOCKCHAIN_CONFIG.MARKETPLACE_ABI,
        this.signer
      );

      // Only the Marketplace admin can issue credits, and only if the Marketplace owns the token.
      const [admin, tokenOwner] = await Promise.all([marketplace.admin(), this.tokenContract!.owner()]);
      if (admin.toLowerCase() !== connectedAddress.toLowerCase()) {
        throw new Error(`The connected wallet is not the Marketplace admin (${admin}). Only the admin can issue credits.`);
      }
      if (tokenOwner.toLowerCase() !== BLOCKCHAIN_CONFIG.MARKETPLACE_ADDRESS.toLowerCase()) {
        throw new Error(`The BCC token is owned by ${tokenOwner}, not the Marketplace, so credits cannot be issued. Transfer token ownership to the Marketplace (see the deploy scripts).`);
      }

      const amountWei = ethers.parseEther(creditAmount.toString());

      // 1. Make sure the NGO has an on-chain record
      let registerTxHash: string | undefined;
      let ngoId: bigint = await marketplace.ngoIdByWallet(ngoAddress);
      if (ngoId === 0n) {
        const registerTx = await marketplace.registerNGO(ngoAddress, ngoName, `project-approval-${Date.now()}`);
        await registerTx.wait();
        registerTxHash = registerTx.hash;
        ngoId = await marketplace.ngoIdByWallet(ngoAddress);
      }

      // 2. Verify the NGO and mint the credits in one transaction (2 = Verified)
      const tx = await marketplace.verifyNGO(ngoId, 2, amountWei);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash,
        registerTxHash,
        ngoWallet: ngoAddress,
        auditorWallet: auditorAddress
      };
    } catch (error: any) {
      console.error('Issuing credits failed:', error);

      let errorMessage = error.shortMessage || error.message || 'Unknown error';
      if (errorMessage.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fees - need Sepolia testnet ETH';
      }

      return {
        success: false,
        error: errorMessage,
        ngoWallet: ngoAddress,
        auditorWallet: auditorAddress
      };
    }
  }

  /**
   * Pre-flight checks before transaction
   */
  async preflightCheck(companyAddress: string, paymentAmountETH: string): Promise<{
    success: boolean;
    error?: string;
    gasPrice?: string;
    estimatedGas?: string;
  }> {
    try {
      await this.initialize();
      
      const connectedAddress = await this.signer!.getAddress();
      
      // Check wallet connection
      if (connectedAddress.toLowerCase() !== companyAddress.toLowerCase()) {
        return {
          success: false,
          error: `Wrong wallet connected. Please connect: ${companyAddress}`
        };
      }
      
      // Check network
      const network = await this.provider!.getNetwork();
      if (network.chainId !== BigInt(BLOCKCHAIN_CONFIG.NETWORK_CONFIG.chainId)) {
        return {
          success: false,
          error: `Wrong network. Please switch to ${BLOCKCHAIN_CONFIG.NETWORK_CONFIG.chainName}`
        };
      }
      
      // Check balance
      const balance = await this.provider!.getBalance(companyAddress);
      const paymentAmount = ethers.parseEther(paymentAmountETH);
      const requiredAmount = paymentAmount + ethers.parseEther("0.001"); // Gas buffer
      
      if (balance < requiredAmount) {
        return {
          success: false,
          error: `Insufficient balance. Need ${ethers.formatEther(requiredAmount)} ETH, have ${ethers.formatEther(balance)} ETH`
        };
      }
      
      // Get gas price for estimation
      const gasPrice = await this.provider!.getFeeData();
      
      return {
        success: true,
        gasPrice: ethers.formatUnits(gasPrice.gasPrice || BigInt(0), 'gwei'),
        estimatedGas: "0.001"
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: `Pre-flight check failed: ${error.message}`
      };
    }
  }

  /**
   * Transfer credits to company after purchase using marketplace
   */
  async transferCreditsToCompany(
    ngoAddress: string,
    companyAddress: string,
    creditAmount: number,
    paymentAmountETH: string
  ): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
    message?: string;
    ngoWallet?: string;
    companyWallet?: string;
    paymentTx?: string;
    balances?: {
      companyETH: string;
      companyBCC: string;
      ngoETH: string;
    };
  }> {
    try {
      // Run pre-flight checks
      const preflightResult = await this.preflightCheck(companyAddress, paymentAmountETH);
      if (!preflightResult.success) {
        throw new Error(preflightResult.error);
      }
      
      console.log(`✅ Pre-flight checks passed - ready for transaction`);

      const connectedAddress = await this.signer!.getAddress();

      // Convert amounts
      const tokenAmount = ethers.parseEther(creditAmount.toString());
      const paymentAmount = ethers.parseEther(paymentAmountETH);

      // Marketplace.executeTrade uses transferFrom(NGO -> Company), so the NGO
      // must have approved the marketplace for at least this many credits.
      const allowance: bigint = await this.tokenContract!.allowance(ngoAddress, BLOCKCHAIN_CONFIG.MARKETPLACE_ADDRESS);
      if (allowance < tokenAmount) {
        throw new Error(
          `The NGO has only approved ${ethers.formatEther(allowance)} BCC for sale on the marketplace (need ${creditAmount}). ` +
          `Ask the NGO to open "Manage Credits" and approve credits for sale first.`
        );
      }

      // Execute trade through marketplace (combines payment + minting)
      console.log(`🏪 MARKETPLACE TRANSACTION: Executing complete trade`);
      console.log(`📤 Seller (NGO): ${ngoAddress}`);
      console.log(`📥 Buyer (Company): ${companyAddress}`);
      console.log(`💰 Payment: ${paymentAmountETH} ETH`);
      console.log(`📦 Credits: ${creditAmount} BCC`);
      
      // Check balance before transaction
      const currentBalance = await this.provider!.getBalance(companyAddress);
      const requiredAmount = paymentAmount + ethers.parseEther("0.01"); // Buffer for gas
      
      if (currentBalance < requiredAmount) {
        throw new Error(`Insufficient balance. Need ${ethers.formatEther(requiredAmount)} ETH, have ${ethers.formatEther(currentBalance)} ETH`);
      }
      
      // Execute trade through marketplace (pays NGO in ETH + mints BCC to Company)
      console.log(`🏪 REAL TRANSACTION: Executing trade through marketplace contract`);
      console.log(`📦 Credits: ${creditAmount} BCC`);
      console.log(`💰 Payment: ${paymentAmountETH} ETH`);
      
      // Create marketplace contract instance
      const marketplaceContract = new ethers.Contract(
        BLOCKCHAIN_CONFIG.MARKETPLACE_ADDRESS,
        BLOCKCHAIN_CONFIG.MARKETPLACE_ABI,
        this.signer
      );
      
      // Execute trade through marketplace
      // function executeTrade(address seller, address buyer, uint256 amount, string pdfHash) payable returns (uint256)
      const pdfHash = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        console.log(`🔄 Calling marketplace executeTrade...`);
        const tradeTx = await marketplaceContract.executeTrade(
          ngoAddress,      // seller (NGO)
          companyAddress,  // buyer (Company) 
          tokenAmount,     // amount of tokens
          pdfHash,         // pdf hash for trade record
          { 
            value: paymentAmount, // ETH payment
            gasLimit: 300000      // generous gas limit
          }
        );
        
        console.log(`⏳ Marketplace trade submitted: ${tradeTx.hash}`);
        const tradeReceipt = await tradeTx.wait();
        console.log(`✅ Trade executed successfully! Block: ${tradeReceipt?.blockNumber}`);
        
        // Check final balances
        const companyETHBalance = await this.provider!.getBalance(companyAddress);
        const companyTokenBalance = await this.tokenContract!.balanceOf(companyAddress);
        const ngoETHBalance = await this.provider!.getBalance(ngoAddress);
        
        console.log(`💰 Post-trade balances:`);
        console.log(`Company ETH: ${ethers.formatEther(companyETHBalance)}`);
        console.log(`Company BCC: ${ethers.formatEther(companyTokenBalance)}`);
        console.log(`NGO ETH: ${ethers.formatEther(ngoETHBalance)}`);
        
        return {
          success: true,
          txHash: tradeTx.hash,
          paymentTx: tradeTx.hash,
          companyWallet: companyAddress, 
          ngoWallet: ngoAddress,
          message: `✅ MARKETPLACE TRADE COMPLETE!\n\n💰 ETH Payment: ${paymentAmountETH} ETH sent to NGO\n🪙 BCC Tokens: ${creditAmount} BCC minted to Company\n\n🔗 Trade TX: ${tradeTx.hash}\n🔍 View on Etherscan: https://sepolia.etherscan.io/tx/${tradeTx.hash}`,
          balances: {
            companyETH: ethers.formatEther(companyETHBalance),
            companyBCC: ethers.formatEther(companyTokenBalance),
            ngoETH: ethers.formatEther(ngoETHBalance)
          }
        };
        
      } catch (marketplaceError: any) {
        console.error('❌ Marketplace trade failed:', marketplaceError);
        throw marketplaceError;
      }

    } catch (error: any) {
      console.error('Token transfer failed:', error);
      
      // Parse common error messages
      let errorMessage = error.message || 'Unknown error';
      
      if (errorMessage.includes('execution reverted')) {
        if (errorMessage.includes('estimateGas')) {
          errorMessage = `🚫 Transaction Failed: Gas estimation failed\n\nThis usually means:\n• Insufficient ETH balance\n• Contract not properly deployed\n• Invalid transaction parameters\n\n➡️ Please check your wallet balance and try again`;
        } else {
          errorMessage = `🚫 Transaction Reverted\n\nPossible causes:\n• Insufficient balance\n• Contract restrictions\n• Network congestion\n\n➡️ Please try again`;
        }
      } else if (errorMessage.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fees - need Sepolia testnet ETH';
      }

      return {
        success: false,
        error: errorMessage,
        companyWallet: companyAddress,
        ngoWallet: ngoAddress
      };
    }
  }

  /**
   * NGO approves the marketplace contract to sell `creditAmount` BCC on its behalf.
   * Required before any company can buy credits via Marketplace.executeTrade.
   */
  async approveMarketplace(creditAmount: number): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      await this.initialize();
      const amount = ethers.parseEther(creditAmount.toString());
      const tx = await this.tokenContract!.approve(BLOCKCHAIN_CONFIG.MARKETPLACE_ADDRESS, amount);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      const msg = error?.message?.includes('user rejected') ? 'Transaction was rejected by user' : (error?.message || 'Approval failed');
      return { success: false, error: msg };
    }
  }

  /**
   * How many BCC the marketplace may currently sell on behalf of `ownerAddress`.
   */
  async getMarketplaceAllowance(ownerAddress: string): Promise<string> {
    try {
      await this.initialize();
      const allowance = await this.tokenContract!.allowance(ownerAddress, BLOCKCHAIN_CONFIG.MARKETPLACE_ADDRESS);
      return ethers.formatEther(allowance);
    } catch (error) {
      console.error('Failed to get allowance:', error);
      return '0';
    }
  }

  /**
   * Get token balance for an address
   */
  async getTokenBalance(address: string): Promise<string> {
    try {
      await this.initialize();
      const balance = await this.tokenContract!.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return '0';
    }
  }

  /**
   * Get ETH balance for an address
   */
  async getETHBalance(address: string): Promise<string> {
    try {
      if (!this.provider) await this.initialize();
      const balance = await this.provider!.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get ETH balance:', error);
      return '0';
    }
  }

  /**
   * Get all balances for role-based wallets
   */
  async getAllWalletBalances(): Promise<{
    NGO: { eth: string; tokens: string; address: string };
    COMPANY: { eth: string; tokens: string; address: string };
    AUDITOR: { eth: string; tokens: string; address: string };
  }> {
    const balances = {
      NGO: { 
        eth: await this.getETHBalance(FIXED_WALLETS.NGO),
        tokens: await this.getTokenBalance(FIXED_WALLETS.NGO),
        address: FIXED_WALLETS.NGO
      },
      COMPANY: { 
        eth: await this.getETHBalance(FIXED_WALLETS.COMPANY),
        tokens: await this.getTokenBalance(FIXED_WALLETS.COMPANY),
        address: FIXED_WALLETS.COMPANY
      },
      AUDITOR: { 
        eth: await this.getETHBalance(FIXED_WALLETS.AUDITOR),
        tokens: await this.getTokenBalance(FIXED_WALLETS.AUDITOR),
        address: FIXED_WALLETS.AUDITOR
      }
    };

    return balances;
  }
}

export const tokenTransferService = new TokenTransferService();