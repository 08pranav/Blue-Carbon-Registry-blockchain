import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { web3Helper } from '@/blockchain-integration/web3Helper';
import { ExternalLink, CheckCircle, XCircle, Clock, Users, ArrowRight } from 'lucide-react';

interface WalletInfo {
  address: string;
  ethBalance: string;
  bccBalance: string;
  role: 'admin' | 'ngo' | 'company' | 'unknown';
}

const BlueCarbon3WalletDemo: React.FC = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  const [loading, setLoading] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Form states
  const [ngoName, setNgoName] = useState('');
  const [ngoDocuments, setNgoDocuments] = useState('QmExampleNGODocuments123');
  const [companyName, setCompanyName] = useState('');
  const [ngoIdToVerify, setNgoIdToVerify] = useState<string>('');
  const [creditsToAllocate, setCreditsToAllocate] = useState<string>('');
  const [tradeAmount, setTradeAmount] = useState<string>('');
  const [tradePrice, setTradePrice] = useState<string>('');
  const [sellerAddress, setSellerAddress] = useState<string>('');

  const ADMIN_ADDRESS = '0x179d59195f5771E907463986bCE98B0369e52837';

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const setErrorMessage = (message: string) => {
    setError(message);
    setSuccess('');
  };

  const setSuccessMessage = (message: string) => {
    setSuccess(message);
    setError('');
  };

  const determineRole = (address: string): 'admin' | 'ngo' | 'company' | 'unknown' => {
    if (address.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
      return 'admin';
    }
    return 'unknown';
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    clearMessages();

    try {
      const walletData = await web3Helper.connectWallet();
      const bccBalance = await web3Helper.getBCCBalance();
      
      const wallet: WalletInfo = {
        address: walletData.address,
        ethBalance: walletData.balance,
        bccBalance,
        role: determineRole(walletData.address)
      };
      
      setWalletInfo(wallet);
      setSuccessMessage(`Connected as ${wallet.role.toUpperCase()}: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const refreshBalances = async () => {
    if (!walletInfo) return;

    try {
      const ethBalance = await web3Helper.getETHBalance();
      const bccBalance = await web3Helper.getBCCBalance();
      
      setWalletInfo(prev => prev ? {
        ...prev,
        ethBalance,
        bccBalance
      } : null);
    } catch (error: any) {
      setErrorMessage(`Failed to refresh balances: ${error.message}`);
    }
  };

  const registerNGO = async () => {
    if (!ngoName.trim()) {
      setErrorMessage('Please enter NGO name');
      return;
    }

    setLoading('Registering NGO...');
    clearMessages();

    try {
      const result = await web3Helper.registerNGO(ngoName, ngoDocuments);
      setTxHash(result.txHash);
      setSuccessMessage(`NGO registered successfully! NGO ID: ${result.ngoId}`);
      setNgoName('');
      await refreshBalances();
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading('');
    }
  };

  const registerCompany = async () => {
    if (!companyName.trim()) {
      setErrorMessage('Please enter company name');
      return;
    }

    setLoading('Registering Company...');
    clearMessages();

    try {
      const result = await web3Helper.registerCompany(companyName, 'QmExampleCompanyKYC456');
      setTxHash(result.txHash);
      setSuccessMessage(`Company registered successfully! Company ID: ${result.companyId}`);
      setCompanyName('');
      await refreshBalances();
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading('');
    }
  };

  const verifyNGOAndAllocate = async () => {
    if (!ngoIdToVerify || !creditsToAllocate) {
      setErrorMessage('Please enter NGO ID and credits amount');
      return;
    }

    setLoading('Verifying NGO and allocating credits...');
    clearMessages();

    try {
      const txHash = await web3Helper.verifyNGOAndAllocateCredits(
        parseInt(ngoIdToVerify),
        2,
        parseInt(creditsToAllocate)
      );
      setTxHash(txHash);
      setSuccessMessage(`NGO verified and ${creditsToAllocate} BCC credits allocated!`);
      setNgoIdToVerify('');
      setCreditsToAllocate('');
      await refreshBalances();
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading('');
    }
  };

  const approveCreditsForSale = async () => {
    if (!tradeAmount) {
      setErrorMessage('Please enter amount to approve');
      return;
    }

    setLoading('Approving credits for marketplace...');
    clearMessages();

    try {
      const txHash = await web3Helper.approveCreditsForSale(parseInt(tradeAmount));
      setTxHash(txHash);
      setSuccessMessage(`Approved ${tradeAmount} BCC for trading on marketplace!`);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading('');
    }
  };

  const buyCredits = async () => {
    if (!sellerAddress || !tradeAmount || !tradePrice) {
      setErrorMessage('Please fill all trade details');
      return;
    }

    setLoading('Executing trade...');
    clearMessages();

    try {
      const txHash = await web3Helper.buyCredits(
        sellerAddress,
        parseInt(tradeAmount),
        parseFloat(tradePrice),
        'QmTradePDFHash123'
      );
      setTxHash(txHash);
      setSuccessMessage(`Successfully bought ${tradeAmount} BCC for ${tradePrice} ETH!`);
      setTradeAmount('');
      setTradePrice('');
      setSellerAddress('');
      await refreshBalances();
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌊 Blue Carbon Registry - Multi-Wallet Demo
          </h1>
          <p className="text-gray-600 text-lg">
            Complete NGO → Admin → Company Trading Flow on Sepolia Testnet
          </p>
        </div>

        {/* Wallet Connection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Wallet Connection
            </CardTitle>
            <CardDescription>
              Connect different MetaMask accounts to test Admin, NGO, and Company roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!walletInfo ? (
              <Button 
                onClick={connectWallet} 
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? 'Connecting...' : 'Connect MetaMask Wallet'}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">Connected Wallet</p>
                    <p className="text-sm text-gray-600">{walletInfo.address}</p>
                    <Badge className={`mt-1 ${
                      walletInfo.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      walletInfo.role === 'ngo' ? 'bg-green-100 text-green-800' :
                      walletInfo.role === 'company' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {walletInfo.role.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">ETH Balance</p>
                    <p className="font-semibold">{parseFloat(walletInfo.ethBalance).toFixed(4)} ETH</p>
                    <p className="text-sm text-gray-600 mt-1">BCC Balance</p>
                    <p className="font-semibold text-green-600">{parseFloat(walletInfo.bccBalance).toFixed(2)} BCC</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={refreshBalances} variant="outline" size="sm">
                    Refresh Balances
                  </Button>
                  <Button onClick={() => setWalletInfo(null)} variant="outline" size="sm">
                    Disconnect
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <Alert className="border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600 animate-spin" />
            <AlertDescription className="text-blue-800">{loading}</AlertDescription>
          </Alert>
        )}

        {/* Transaction Hash */}
        {txHash && (
          <Alert className="border-purple-200 bg-purple-50">
            <ExternalLink className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              Transaction Hash: 
              <a 
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 underline hover:text-purple-900"
              >
                {txHash.slice(0, 10)}...{txHash.slice(-10)}
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* Demo Flow */}
        {walletInfo && (
          <Card>
            <CardHeader>
              <CardTitle>📋 Complete Business Flow Demo</CardTitle>
              <CardDescription>
                Follow this step-by-step process with multiple MetaMask accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Step 1: NGO Registration */}
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-semibold">1</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">NGO Registers Project</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Switch to NGO wallet and register organization
                  </p>
                  <div className="mt-3 space-y-2">
                    <Input
                      placeholder="Ocean Conservation NGO"
                      value={ngoName}
                      onChange={(e) => setNgoName(e.target.value)}
                    />
                    <Button onClick={registerNGO} disabled={!!loading} size="sm">
                      Register NGO
                    </Button>
                  </div>
                </div>
              </div>

              <ArrowRight className="mx-auto h-5 w-5 text-gray-400" />

              {/* Step 2: Admin Verification */}
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center font-semibold">2</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Admin Verifies & Allocates Credits</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Switch to admin wallet and verify NGO project
                  </p>
                  {walletInfo.role !== 'admin' && (
                    <Alert className="mt-2 border-orange-200 bg-orange-50">
                      <AlertDescription className="text-orange-800">
                        ⚠️ Switch to admin wallet: {ADMIN_ADDRESS.slice(0, 6)}...{ADMIN_ADDRESS.slice(-4)}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Input
                      placeholder="NGO ID (e.g., 1)"
                      value={ngoIdToVerify}
                      onChange={(e) => setNgoIdToVerify(e.target.value)}
                    />
                    <Input
                      placeholder="Credits (e.g., 1000)"
                      value={creditsToAllocate}
                      onChange={(e) => setCreditsToAllocate(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={verifyNGOAndAllocate} 
                    disabled={!!loading || walletInfo.role !== 'admin'} 
                    size="sm"
                    className="mt-2"
                  >
                    Verify & Allocate Credits
                  </Button>
                </div>
              </div>

              <ArrowRight className="mx-auto h-5 w-5 text-gray-400" />

              {/* Step 3: NGO Approves Credits */}
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-semibold">3</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">NGO Approves Credits for Sale</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Switch back to NGO wallet and approve credits for marketplace
                  </p>
                  <div className="mt-3 space-y-2">
                    <Input
                      placeholder="Amount to sell (e.g., 100)"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                    />
                    <Button onClick={approveCreditsForSale} disabled={!!loading} size="sm">
                      Approve for Sale
                    </Button>
                  </div>
                </div>
              </div>

              <ArrowRight className="mx-auto h-5 w-5 text-gray-400" />

              {/* Step 4: Company Buys Credits */}
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-semibold">4</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Company Buys Credits</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Switch to company wallet and purchase credits
                  </p>
                  <div className="mt-3 space-y-2">
                    <Input
                      placeholder="Company Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                    <Button onClick={registerCompany} disabled={!!loading} size="sm">
                      Register Company First
                    </Button>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="NGO Address"
                        value={sellerAddress}
                        onChange={(e) => setSellerAddress(e.target.value)}
                      />
                      <Input
                        placeholder="Amount"
                        value={tradeAmount}
                        onChange={(e) => setTradeAmount(e.target.value)}
                      />
                      <Input
                        placeholder="Price (ETH)"
                        value={tradePrice}
                        onChange={(e) => setTradePrice(e.target.value)}
                      />
                    </div>
                    <Button onClick={buyCredits} disabled={!!loading} size="sm">
                      Buy Credits
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Multi-Wallet Setup Required</h4>
                <p className="text-yellow-700 text-sm">
                  Create 3 MetaMask accounts: Admin ({ADMIN_ADDRESS.slice(0, 6)}...{ADMIN_ADDRESS.slice(-4)}), NGO, and Company. 
                  Send 0.02 ETH to NGO and 0.1 ETH to Company wallets for testing.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contract Links */}
        <Card>
          <CardHeader>
            <CardTitle>📜 Deployed Contracts on Sepolia</CardTitle>
            <CardDescription>
              View transactions and contract interactions on Etherscan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">BCC Token Contract</p>
                  <p className="text-sm text-gray-600">0x3112...870a</p>
                </div>
                <a
                  href="https://sepolia.etherscan.io/address/0x3112Fde0b77b1cbd48c3cEA6260Cb5CB9258870a"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Marketplace Contract</p>
                  <p className="text-sm text-gray-600">0x7A88...8B6E</p>
                </div>
                <a
                  href="https://sepolia.etherscan.io/address/0x7A8862493655BdBC9058eb11d97E589516cfAD12"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlueCarbon3WalletDemo;