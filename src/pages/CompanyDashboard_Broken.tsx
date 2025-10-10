import React, { useState, useEffect } from 'react';
import { useRoleAuth } from '../contexts/RoleAuthContext';
      
      // Check contract ownership
      const ownershipCheck = await transactionDebugger.checkContractOwnership(FIXED_WALLETS.COMPANY);
      setDebugInfo(prev => prev + `👑 Contract Owner: ${ownershipCheck.contractOwner}\n`);
      setDebugInfo(prev => prev + `🎯 Company Wallet: ${FIXED_WALLETS.COMPANY}\n`);
      setDebugInfo(prev => prev + `✅ Is Owner: ${ownershipCheck.isOwner}\n\n`);
      
      // Test minting permissions
      const mintTest = await transactionDebugger.testMinting(FIXED_WALLETS.COMPANY, '1');
      if (mintTest.canMint) {
        setDebugInfo(prev => prev + `✅ Minting Test: PASSED\n⛽ Gas Estimate: ${mintTest.gasEstimate}\n\n`);
      } else {
        setDebugInfo(prev => prev + `❌ Minting Test: FAILED\n🚫 Error: ${mintTest.error}\n\n`);
      }
      
      // Check current balances
      const tokenBal = await transactionDebugger.getTokenBalance(FIXED_WALLETS.COMPANY);
      setDebugInfo(prev => prev + `💰 Current BCC Balance: ${tokenBal}\n`);
      
    } catch (error: any) {
      setDebugInfo(prev => prev + `❌ Debug failed: ${error.message}\n`);
    }
  };s/RoleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { WalletHelper } from '../utils/WalletHelper';
import { Badge } from '../components/ui/badge';
import DemoInstructions from '../components/DemoInstructions';
import { transactionDebugger } from '../utils/TransactionDebugger';
import { ExternalLink, CheckCircle, AlertCircle, Loader, Video, Building2, ShoppingCart, Leaf, Wallet, TrendingUp, MapPin, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { tokenTransferService } from '../utils/TokenTransferService';
import { FIXED_WALLETS } from '../utils/fixedWallets';

interface CarbonListing {
  id: string;
  ngoName: string;
  ngoAddress: string;
  projectTitle: string;
  location: string;
  creditsAvailable: number;
  pricePerCredit: number;
  totalPrice: number;
  projectType: string;
  verificationDate: string;
}

export default function CompanyDashboard() {
  const { authState, logout } = useRoleAuth();
  const [listings, setListings] = useState<CarbonListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [ethBalance, setEthBalance] = useState('0');
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Mock marketplace listings (in real app, this would come from blockchain/API)
  const mockListings: CarbonListing[] = [
    {
      id: '1',
      ngoName: 'Ocean Blue Conservation',
      ngoAddress: FIXED_WALLETS.NGO,
      projectTitle: 'Mangrove Restoration - Sundarbans',
      location: 'West Bengal, India',
      creditsAvailable: 500,
      pricePerCredit: 0.001, // 0.001 ETH per credit
      totalPrice: 0.5,
      projectType: 'Mangrove Restoration',
      verificationDate: '2024-09-20'
    },
    {
      id: '2', 
      ngoName: 'Coastal Protection Alliance',
      ngoAddress: FIXED_WALLETS.NGO,
      projectTitle: 'Seagrass Conservation Program',
      location: 'Tamil Nadu, India',
      creditsAvailable: 300,
      pricePerCredit: 0.0015,
      totalPrice: 0.45,
      projectType: 'Seagrass Conservation',
      verificationDate: '2024-09-15'
    },
    {
      id: '3',
      ngoName: 'Marine Ecosystem Trust',
      ngoAddress: FIXED_WALLETS.NGO,
      projectTitle: 'Salt Marsh Restoration',
      location: 'Gujarat, India',
      creditsAvailable: 750,
      pricePerCredit: 0.0012,
      totalPrice: 0.9,
      projectType: 'Salt Marsh Restoration',
      verificationDate: '2024-09-25'
    }
  ];

  useEffect(() => {
    setListings(mockListings);
    loadWalletBalances();
  }, []);

  const loadWalletBalances = async () => {
    try {
      const ethBal = await tokenTransferService.getETHBalance(FIXED_WALLETS.COMPANY);
      const tokenBal = await tokenTransferService.getTokenBalance(FIXED_WALLETS.COMPANY);
      setEthBalance(ethBal);
      setTokenBalance(tokenBal);
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  };

  const handlePurchase = async (listing: CarbonListing, quantity: number) => {
    setPurchasing(listing.id);
    
    try {
      const totalPrice = (listing.pricePerCredit * quantity).toString();
      
      console.log(`🛒 REAL BLOCKCHAIN PURCHASE: ${quantity} credits from ${listing.ngoName}`);
      console.log(`💰 Total cost: ${totalPrice} ETH`);
      
      // Pre-flight checks for demo video
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const currentAccount = accounts[0];
        
        if (currentAccount.toLowerCase() !== FIXED_WALLETS.COMPANY.toLowerCase()) {
          alert(`🔑 WALLET MISMATCH!\n\nFor the demo, please connect the Company wallet:\n${FIXED_WALLETS.COMPANY}\n\nCurrently connected:\n${currentAccount}\n\nSwitch wallet in MetaMask and try again.`);
          return;
        }
        
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0xaa36a7') {
          alert(`🌐 WRONG NETWORK!\n\nPlease switch to Sepolia Testnet in MetaMask.\n\nCurrent: ${chainId}\nRequired: 0xaa36a7 (Sepolia)`);
          return;
        }
        
        console.log('✅ Pre-flight checks passed - executing real blockchain transaction...');
      }
      
      // Try real blockchain purchase first
      let result = await tokenTransferService.transferCreditsToCompany(
        listing.ngoAddress,
        FIXED_WALLETS.COMPANY,
        quantity,
        totalPrice
      );
      
      // If blockchain fails, fallback to demo mode
      if (!result.success) {
        console.log('🔄 Blockchain purchase failed, using fallback mode...');
        const { DemoBlockchainService } = await import('../utils/DemoBlockchainService.js');
        result = await DemoBlockchainService.simulateCreditPurchase(
          quantity, 
          totalPrice, 
          listing.ngoAddress, 
          FIXED_WALLETS.COMPANY, 
          true // Force fallback mode
        );
        
        if (result && result.success) {
          alert(`🔄 Blockchain Unavailable - Used Fallback Mode\n\n✅ Purchase simulated successfully!\n\n🎉 Purchased ${quantity} carbon credits for ${totalPrice} ETH\n\nSimulated TX: ${result.txHash}\n\n💡 This simulates the purchase. Real blockchain will work when properly connected.`);
        }
      } else {
        // Real blockchain success with balance details
        const balanceInfo = result.balances ? 
          `\n\n💰 Updated Balances:\nCompany ETH: ${result.balances.companyETH.substring(0, 8)}\nCompany BCC: ${result.balances.companyBCC.substring(0, 8)}\nNGO ETH: ${result.balances.ngoETH.substring(0, 8)}` : '';
        
        alert(`🚀 REAL BLOCKCHAIN PURCHASE SUCCESSFUL!\n\n🎉 Purchased ${quantity} carbon credits for ${totalPrice} ETH\n\n📝 Transaction Details:\n💸 Payment TX: ${result.paymentTx}\n🪙 Token TX: ${result.txHash}\n\n✅ Real Sepolia testnet transactions completed!${balanceInfo}\n\n🔍 View on Etherscan:\nhttps://sepolia.etherscan.io/tx/${result.paymentTx}`);
      }
      
      if (result && result.success) {
        // Update listing availability
        setListings(prev => prev.map(l => 
          l.id === listing.id 
            ? { ...l, creditsAvailable: l.creditsAvailable - quantity }
            : l
        ));
        
        // Refresh balances
        loadWalletBalances();
      } else {
        alert(`❌ Purchase Failed: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert(`❌ Purchase Failed: ${error}`);
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Carbon Credits Marketplace</h1>
              <p className="text-gray-600">Purchase verified blue carbon credits</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Company Wallet</div>
              <div className="font-mono text-sm">ETH: {ethBalance.substring(0, 8)}</div>
              <div className="font-mono text-sm">BCC: {tokenBalance.substring(0, 8)}</div>
            </div>
            <Button onClick={logout} variant="outline">Logout</Button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Wallet className="w-5 h-5 text-blue-600" />
                <Badge variant="secondary">Wallet</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tokenBalance.substring(0, 6)}</div>
              <p className="text-sm text-gray-600">BCC Tokens Owned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <Badge variant="secondary">Balance</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ethBalance.substring(0, 6)} ETH</div>
              <p className="text-sm text-gray-600">Available for Purchase</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
                <Badge variant="secondary">Market</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listings.length}</div>
              <p className="text-sm text-gray-600">Available Projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Leaf className="w-5 h-5 text-green-600" />
                <Badge variant="secondary">Credits</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listings.reduce((sum, l) => sum + l.creditsAvailable, 0)}</div>
              <p className="text-sm text-gray-600">Total Available Credits</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="marketplace" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="demo" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Demo Guide
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-6">
            {/* Marketplace Listings */}
            <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Available Carbon Credits</h2>
            <Button onClick={loadWalletBalances} variant="outline" size="sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{listing.projectTitle}</CardTitle>
                      <CardDescription className="text-base font-medium text-blue-600">
                        {listing.ngoName}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Project Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{listing.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Verified: {listing.verificationDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Leaf className="w-4 h-4 text-gray-500" />
                        <span>{listing.projectType}</span>
                      </div>
                    </div>

                    {/* Pricing Info */}
                    <div className="space-y-3">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {listing.pricePerCredit} ETH
                        </div>
                        <div className="text-sm text-gray-600">per credit</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {listing.creditsAvailable} Credits Available
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Value: {listing.totalPrice} ETH
                        </div>
                      </div>
                    </div>

                    {/* Purchase Actions */}
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Quantity"
                          min="1"
                          max={listing.creditsAvailable}
                          defaultValue="1"
                          id={`quantity-${listing.id}`}
                          className="w-20"
                        />
                        <Button
                          onClick={() => {
                            const input = document.getElementById(`quantity-${listing.id}`) as HTMLInputElement;
                            const quantity = parseInt(input?.value || '1');
                            if (quantity > 0 && quantity <= listing.creditsAvailable) {
                              handlePurchase(listing, quantity);
                            } else {
                              alert('Please enter a valid quantity');
                            }
                          }}
                          disabled={purchasing === listing.id || listing.creditsAvailable === 0}
                          className="flex-1"
                        >
                          {purchasing === listing.id ? (
                            <>
                              <TrendingUp className="w-4 h-4 mr-2 animate-spin" />
                              Purchasing...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Buy Credits
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {listing.creditsAvailable === 0 && (
                        <Badge variant="destructive" className="w-full justify-center">
                          Sold Out
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
            </div>
          </TabsContent>

          <TabsContent value="demo">
            <DemoInstructions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}