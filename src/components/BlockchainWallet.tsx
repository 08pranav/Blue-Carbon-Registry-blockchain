import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { 
  Wallet, 
  Coins, 
  Network, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export const BlockchainWallet: React.FC = () => {
  const {
    isConnected,
    walletAddress,
    ethBalance,
    tokenBalance,
    networkInfo,
    connecting,
    connectWallet,
    disconnectWallet,
    refreshBalances
  } = useBlockchain();

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success('Address copied to clipboard!');
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const viewOnEtherscan = () => {
    if (walletAddress && networkInfo) {
      const baseUrl = networkInfo.chainId === 11155111 
        ? 'https://sepolia.etherscan.io' 
        : 'https://etherscan.io';
      window.open(`${baseUrl}/address/${walletAddress}`, '_blank');
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>
            Connect your MetaMask wallet to interact with the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={connectWallet} 
            disabled={connecting} 
            className="w-full"
            size="lg"
          >
            {connecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect MetaMask
              </>
            )}
          </Button>
          
          <div className="mt-4 text-sm text-center text-gray-600">
            <p>Make sure you have MetaMask installed and are on the Sepolia testnet</p>
            <div className="flex justify-center space-x-4 mt-2">
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Install MetaMask
              </a>
              <a 
                href="https://sepoliafaucet.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Get Sepolia ETH
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <CardTitle className="text-lg">Wallet Connected</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshBalances}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={disconnectWallet}
            >
              Disconnect
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Address */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-700">Wallet Address</p>
            <p className="text-sm font-mono text-gray-900">
              {shortenAddress(walletAddress!)}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAddress}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={viewOnEtherscan}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Network Info */}
        {networkInfo && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Network className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-700">Network</p>
                <p className="text-sm text-blue-600">{networkInfo.chainName}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              Chain ID: {networkInfo.chainId}
            </Badge>
          </div>
        )}

        {/* Balances */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Coins className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-green-700">ETH Balance</p>
            </div>
            <p className="text-lg font-bold text-green-900">
              {parseFloat(ethBalance).toFixed(4)} ETH
            </p>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">  
              <Coins className="w-4 h-4 text-purple-600" />
              <p className="text-sm font-medium text-purple-700">BCC Tokens</p>
            </div>
            <p className="text-lg font-bold text-purple-900">
              {parseFloat(tokenBalance).toFixed(0)} BCC
            </p>
          </div>
        </div>

        {/* Low Balance Warning */}
        {parseFloat(ethBalance) < 0.01 && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-700">Low ETH Balance</p>
              <p className="text-xs text-yellow-600">
                You need ETH to pay for transaction fees. 
                <a 
                  href="https://sepoliafaucet.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 underline hover:no-underline"
                >
                  Get Sepolia ETH
                </a>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};