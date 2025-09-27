// Blockchain service for carbon credit tokenization and wallet integration
// This is a mock implementation for demonstration - in production, integrate with actual blockchain

interface WalletConnection {
  address: string;
  balance: number;
  network: string;
  connected: boolean;
}

interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  tokenId?: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed: number;
  blockNumber: number;
}

interface CarbonCreditToken {
  tokenId: string;
  projectId: string;
  projectName: string;
  credits: number;
  vintage: string;
  ecosystem: string;
  location: string;
  mintedDate: Date;
  owner: string;
  retired: boolean;
  retiredDate?: Date;
}

class BlockchainService {
  private wallet: WalletConnection | null = null;
  private mockTokens: CarbonCreditToken[] = [];
  private mockTransactions: BlockchainTransaction[] = [];

  // Wallet connection methods
  async connectWallet(): Promise<WalletConnection> {
    // Simulate wallet connection
    await this.delay(2000);
    
    const mockWallet: WalletConnection = {
      address: this.generateMockAddress(),
      balance: Math.random() * 10 + 5, // 5-15 ETH
      network: 'Polygon',
      connected: true
    };

    this.wallet = mockWallet;
    
    // Generate some mock tokens for this wallet
    this.generateMockTokens(mockWallet.address);
    
    return mockWallet;
  }

  async disconnectWallet(): Promise<void> {
    this.wallet = null;
    this.mockTokens = [];
  }

  getConnectedWallet(): WalletConnection | null {
    return this.wallet;
  }

  // Token management
  async getCarbonCredits(walletAddress: string): Promise<CarbonCreditToken[]> {
    return this.mockTokens.filter(token => token.owner === walletAddress);
  }

  async mintCarbonCredits(
    projectId: string,
    projectName: string,
    credits: number,
    vintage: string,
    ecosystem: string,
    location: string,
    toAddress: string
  ): Promise<{ tokenId: string; transactionHash: string }> {
    await this.delay(3000); // Simulate blockchain transaction time

    const tokenId = 'CC-' + Date.now().toString(36).toUpperCase();
    const transactionHash = '0x' + Math.random().toString(16).substr(2, 64);

    const newToken: CarbonCreditToken = {
      tokenId,
      projectId,
      projectName,
      credits,
      vintage,
      ecosystem,
      location,
      mintedDate: new Date(),
      owner: toAddress,
      retired: false
    };

    this.mockTokens.push(newToken);

    const transaction: BlockchainTransaction = {
      hash: transactionHash,
      from: '0x0000000000000000000000000000000000000000', // Mint from zero address
      to: toAddress,
      value: 0,
      tokenId,
      timestamp: new Date(),
      status: 'confirmed',
      gasUsed: Math.floor(Math.random() * 50000) + 50000,
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000
    };

    this.mockTransactions.push(transaction);

    return { tokenId, transactionHash };
  }

  async transferCarbonCredits(
    tokenId: string,
    fromAddress: string,
    toAddress: string
  ): Promise<string> {
    await this.delay(2000);

    const token = this.mockTokens.find(t => t.tokenId === tokenId);
    if (!token || token.owner !== fromAddress) {
      throw new Error('Token not found or not owned by sender');
    }

    token.owner = toAddress;
    const transactionHash = '0x' + Math.random().toString(16).substr(2, 64);

    const transaction: BlockchainTransaction = {
      hash: transactionHash,
      from: fromAddress,
      to: toAddress,
      value: 0,
      tokenId,
      timestamp: new Date(),
      status: 'confirmed',
      gasUsed: Math.floor(Math.random() * 30000) + 21000,
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000
    };

    this.mockTransactions.push(transaction);
    return transactionHash;
  }

  async retireCarbonCredits(
    tokenId: string,
    ownerAddress: string
  ): Promise<string> {
    await this.delay(2000);

    const token = this.mockTokens.find(t => t.tokenId === tokenId);
    if (!token || token.owner !== ownerAddress) {
      throw new Error('Token not found or not owned by caller');
    }

    if (token.retired) {
      throw new Error('Token already retired');
    }

    token.retired = true;
    token.retiredDate = new Date();

    const transactionHash = '0x' + Math.random().toString(16).substr(2, 64);

    const transaction: BlockchainTransaction = {
      hash: transactionHash,
      from: ownerAddress,
      to: '0x0000000000000000000000000000000000000000', // Burn to zero address
      value: 0,
      tokenId,
      timestamp: new Date(),
      status: 'confirmed',
      gasUsed: Math.floor(Math.random() * 40000) + 30000,
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000
    };

    this.mockTransactions.push(transaction);
    return transactionHash;
  }

  // Transaction queries
  async getTransaction(hash: string): Promise<BlockchainTransaction | null> {
    return this.mockTransactions.find(tx => tx.hash === hash) || null;
  }

  async getTransactionHistory(address: string): Promise<BlockchainTransaction[]> {
    return this.mockTransactions.filter(tx => tx.from === address || tx.to === address);
  }

  // Utility methods
  async verifyTransaction(hash: string): Promise<boolean> {
    await this.delay(1000);
    const transaction = await this.getTransaction(hash);
    return transaction?.status === 'confirmed' || false;
  }

  formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  getNetworkExplorerUrl(hash: string): string {
    return `https://polygonscan.com/tx/${hash}`;
  }

  // Private helper methods
  private generateMockAddress(): string {
    return '0x' + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  private generateMockTokens(walletAddress: string): void {
    // Generate some mock tokens for demonstration
    const mockProjects = [
      {
        projectId: 'PRJ-DEMO1',
        projectName: 'Sundarbans Mangrove Restoration',
        credits: 100,
        vintage: '2024',
        ecosystem: 'MANGROVE',
        location: 'West Bengal, India'
      },
      {
        projectId: 'PRJ-DEMO2',
        projectName: 'Kerala Seagrass Conservation',
        credits: 50,
        vintage: '2024',
        ecosystem: 'SEAGRASS',
        location: 'Kerala, India'
      }
    ];

    mockProjects.forEach((project, index) => {
      const token: CarbonCreditToken = {
        tokenId: `CC-MOCK${index + 1}`,
        ...project,
        mintedDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date in last 90 days
        owner: walletAddress,
        retired: false
      };
      this.mockTokens.push(token);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const blockchainService = new BlockchainService();
export type { WalletConnection, BlockchainTransaction, CarbonCreditToken };