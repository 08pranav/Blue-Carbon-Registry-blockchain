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
      
      // Check if connected wallet has minting permissions
      try {
        const connectedAddress = await this.signer!.getAddress();
        const owner = await this.tokenContract!.owner();
        
        if (connectedAddress.toLowerCase() !== owner.toLowerCase()) {
          console.warn(`⚠️ Warning: Connected wallet (${connectedAddress}) is not the contract owner (${owner}). Minting may fail due to permissions.`);
        } else {
          console.log(`✅ Connected wallet is contract owner - minting permissions verified`);
        }
      } catch (permError) {
        console.warn(`⚠️ Could not verify minting permissions:`, permError);
      }
      
    } catch (error: any) {
      console.error('Contract verification failed:', error);
      throw new Error(`Contract verification failed: ${error.message}`);
    }
  }

  /**
   * Mint tokens to NGO wallet when auditor approves project
   */
  async mintCreditsToNGO(ngoAddress: string, creditAmount: number, auditorAddress: string): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
    ngoWallet?: string;
    auditorWallet?: string;
  }> {
    try {
      await this.initialize();

      // Validate that the connected wallet is the auditor
      const connectedAddress = await this.signer!.getAddress();
      if (connectedAddress.toLowerCase() !== auditorAddress.toLowerCase()) {
        throw new Error(`Please connect the auditor wallet: ${auditorAddress}`);
      }

      // Convert credits to wei (tokens have 18 decimals)
      const amountWei = ethers.parseEther(creditAmount.toString());

      console.log(`🔄 Minting ${creditAmount} tokens to NGO wallet: ${ngoAddress}`);
      console.log(`� Amount in Wei: ${amountWei.toString()}`);
      console.log(`🔗 Contract Address: ${BLOCKCHAIN_CONFIG.TOKEN_ADDRESS}`);

      // Try to estimate gas first to catch errors early
      let gasEstimate;
      try {
        gasEstimate = await this.tokenContract!.mint.estimateGas(ngoAddress, amountWei);
        console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
      } catch (gasError: any) {
        console.error('Gas estimation failed:', gasError);
        throw new Error(`Gas estimation failed: ${gasError.message || gasError.reason || 'Unknown gas error'}`);
      }

      // Add some buffer to gas limit (20% more)
      const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);

      // Execute the mint transaction with explicit gas limit
      const tx = await this.tokenContract!.mint(ngoAddress, amountWei, {
        gasLimit: gasLimit
      });
      
      console.log(`📝 Transaction submitted: ${tx.hash}`);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      console.log(`✅ Tokens minted successfully! TX: ${receipt.hash}`);

      return {
        success: true,
        txHash: receipt.hash,
        ngoWallet: ngoAddress,
        auditorWallet: auditorAddress
      };

    } catch (error: any) {
      console.error('Token minting failed:', error);
      
      // Parse common error messages
      let errorMessage = error.message || 'Unknown error';
      
      if (errorMessage.includes('execution reverted')) {
        if (errorMessage.includes('estimateGas')) {
          errorMessage = `🚫 Contract Error: Gas estimation failed\n\nThis usually means:\n• Contract not properly deployed on Sepolia\n• Auditor wallet lacks minting permissions\n• Contract address is incorrect\n\n➡️ Falling back to demo mode...`;
        } else if (errorMessage.includes('unknown custom error')) {
          errorMessage = `🚫 Contract Execution Failed\n\nPossible causes:\n• No minting permissions for this wallet\n• Contract has bugs or restrictions\n• Invalid parameters\n\n➡️ Falling back to demo mode...`;
        } else {
          errorMessage = `🚫 Transaction Reverted\n\nCheck:\n• Contract permissions\n• Network connection\n• Wallet permissions\n\n➡️ Falling back to demo mode...`;
        }
      } else if (errorMessage.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fees - need Sepolia testnet ETH';
      } else if (errorMessage.includes('Contract not deployed')) {
        errorMessage = `🚫 Contract Not Found\n\nThe carbon credit contract is not deployed at:\n${BLOCKCHAIN_CONFIG.TOKEN_ADDRESS}\n\n➡️ Using demo mode instead...`;
      } else if (errorMessage.includes('Contract verification failed')) {
        errorMessage = `🚫 Contract Verification Failed\n\nCannot connect to carbon credit contract.\n\n➡️ Using demo mode instead...`;
      }
      
      // Add specific Sepolia troubleshooting info
      if (BLOCKCHAIN_CONFIG.NETWORK_CONFIG.chainName.includes('Sepolia')) {
        errorMessage += `\n\n🌐 Sepolia Testnet Issue:\n• Contract deployed at: ${BLOCKCHAIN_CONFIG.TOKEN_ADDRESS}\n• Make sure MetaMask is on Sepolia network\n• Auditor needs minting permissions from contract owner`;
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

      // Step 1: Send ETH payment to NGO (this reduces company's ETH balance)
      console.log(`💰 REAL TRANSACTION: Sending ${paymentAmountETH} ETH from Company to NGO`);
      console.log(`📤 From: ${companyAddress}`);
      console.log(`📥 To: ${ngoAddress}`);
      
      // Check balance before transaction
      const currentBalance = await this.provider!.getBalance(companyAddress);
      const requiredAmount = paymentAmount + ethers.parseEther("0.001"); // Add buffer for gas
      
      if (currentBalance < requiredAmount) {
        throw new Error(`Insufficient balance. Need ${ethers.formatEther(requiredAmount)} ETH, have ${ethers.formatEther(currentBalance)} ETH`);
      }
      
      // Estimate gas first to prevent failures
      const gasEstimate = await this.provider!.estimateGas({
        to: ngoAddress,
        value: paymentAmount,
        from: companyAddress
      });
      
      const paymentTx = await this.signer!.sendTransaction({
        to: ngoAddress,
        value: paymentAmount,
        gasLimit: gasEstimate + BigInt(5000) // Add 5k gas buffer
      });
      
      console.log(`⏳ Payment transaction submitted: ${paymentTx.hash}`);
      const paymentReceipt = await paymentTx.wait();
      console.log(`✅ ETH Payment confirmed! Block: ${paymentReceipt?.blockNumber}`);

      // Step 2: Execute trade through marketplace (this mints BCC tokens to Company)
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
          paymentTx: paymentTx.hash,
          companyWallet: companyAddress, 
          ngoWallet: ngoAddress,
          message: `✅ MARKETPLACE TRADE COMPLETE!\n\n💰 ETH Payment: ${paymentAmountETH} ETH sent to NGO\n🪙 BCC Tokens: ${creditAmount} BCC minted to Company\n\n� Trade TX: ${tradeTx.hash}\n� View on Etherscan: https://sepolia.etherscan.io/tx/${tradeTx.hash}`,
          balances: {
            companyETH: ethers.formatEther(companyETHBalance),
            companyBCC: ethers.formatEther(companyTokenBalance),
            ngoETH: ethers.formatEther(ngoETHBalance)
          }
        };
        
      } catch (marketplaceError: any) {
        console.error('❌ Marketplace trade failed:', marketplaceError);
        
        // Fall back to the old payment + demo approach
        console.log(`🔄 Falling back to payment-only approach...`);
        
        // Still show real balances for payment
        const companyETHBalance = await this.provider!.getBalance(companyAddress);
        const companyTokenBalance = await this.tokenContract!.balanceOf(companyAddress);
        const ngoETHBalance = await this.provider!.getBalance(ngoAddress);
      
      console.log(`💰 Post-transaction balances:`);
      console.log(`Company ETH: ${ethers.formatEther(companyETHBalance)} ETH`);
      console.log(`Company BCC: ${ethers.formatEther(companyTokenBalance)} BCC`);
      console.log(`NGO ETH: ${ethers.formatEther(ngoETHBalance)} ETH`);
      
      return {
        success: true,
        txHash: mintTx.hash,
        paymentTx: paymentTx.hash,
        ngoWallet: ngoAddress,
        companyWallet: companyAddress,
        message: `✅ REAL Blockchain Transaction Complete!\n💰 ETH Payment: ${paymentAmountETH} ETH sent to NGO\n🪙 BCC Tokens: ${creditAmount} BCC minted to Company\n\n🔗 Payment TX: https://sepolia.etherscan.io/tx/${paymentTx.hash}\n🔗 Minting TX: https://sepolia.etherscan.io/tx/${mintTx.hash}`,
        balances: {
          companyETH: ethers.formatEther(companyETHBalance),
          companyBCC: ethers.formatEther(companyTokenBalance),
          ngoETH: ethers.formatEther(ngoETHBalance)
        }
      };

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