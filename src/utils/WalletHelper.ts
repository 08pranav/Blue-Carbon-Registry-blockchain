// Wallet connection helper for demo video
export class WalletHelper {
  static async ensureCorrectWallet(expectedAddress: string, walletName: string) {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed!');
    }

    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const currentAccount = accounts[0];

    if (currentAccount.toLowerCase() !== expectedAddress.toLowerCase()) {
      throw new Error(
        `🔑 Wrong wallet connected!\n\n` +
        `Expected ${walletName} wallet:\n${expectedAddress}\n\n` +
        `Currently connected:\n${currentAccount}\n\n` +
        `Please switch to the correct wallet in MetaMask.`
      );
    }

    console.log(`✅ Correct ${walletName} wallet connected: ${currentAccount}`);
    return currentAccount;
  }

  static async ensureSepoliaNetwork() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed!');
    }

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (chainId !== '0xaa36a7') { // Sepolia chain ID
      throw new Error(
        `🌐 Wrong network!\n\n` +
        `Please switch to Sepolia Testnet in MetaMask.\n\n` +
        `Current network: ${chainId}\n` +
        `Required: 0xaa36a7 (Sepolia)`
      );
    }

    console.log('✅ Connected to Sepolia testnet');
    return chainId;
  }

  static async addSepoliaNetwork() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed!');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xaa36a7',
          chainName: 'Sepolia Testnet',
          nativeCurrency: {
            name: 'SepoliaETH',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
          blockExplorerUrls: ['https://sepolia.etherscan.io'],
        }],
      });
      console.log('✅ Sepolia network added to MetaMask');
    } catch (error) {
      console.error('❌ Failed to add Sepolia network:', error);
      throw error;
    }
  }

  static getEtherscanUrl(txHash: string) {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }

  static async getWalletBalances(address: string) {
    if (!window.ethereum) return null;

    try {
      const provider = new (await import('ethers')).ethers.BrowserProvider(window.ethereum);
      const ethBalance = await provider.getBalance(address);
      
      return {
        eth: (await import('ethers')).ethers.formatEther(ethBalance),
        address: address
      };
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return null;
    }
  }
}