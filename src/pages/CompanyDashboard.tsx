import React, { useState, useEffect } from 'react';
import { useRoleAuth } from '../contexts/RoleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { WalletHelper } from '../utils/WalletHelper';
import { Badge } from '../components/ui/badge';
import DemoInstructions from '../components/DemoInstructions';
import { ExternalLink, CheckCircle, AlertCircle, Loader, Video, Building2, ShoppingCart, Leaf, Wallet, TrendingUp, MapPin, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { tokenTransferService } from '../utils/TokenTransferService';
import { FIXED_WALLETS } from '../utils/fixedWallets';
import { ethers } from 'ethers';
import { BLOCKCHAIN_CONFIG } from '../blockchain-integration/config';

interface CarbonListing {
  id: string;
  projectTitle: string;
  ngoName: string;
  ngoAddress: string;
  location: string;
  projectType: string;
  creditsAvailable: number;
  pricePerCredit: number;
  certificationBody: string;
  projectDescription: string;
  impactDescription: string;
  vintage: string;
}

export default function CompanyDashboard() {
  const { logout } = useRoleAuth();
  const [listings, setListings] = useState<CarbonListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [ethBalance, setEthBalance] = useState('0');

  // Sample carbon credit listings
  const sampleListings: CarbonListing[] = [
    {
      id: 'project-1',
      projectTitle: 'Mangrove Restoration Initiative',
      ngoName: 'Blue Ocean Foundation',
      ngoAddress: FIXED_WALLETS.NGO,
      location: 'Sundarbans, Bangladesh',
      projectType: 'Blue Carbon - Mangrove Conservation',
      creditsAvailable: 1000,
      pricePerCredit: 0.001, // ETH
      certificationBody: 'Verra VCS',
      vintage: '2024',
      projectDescription: 'Large-scale mangrove restoration project covering 500 hectares of degraded coastal areas.',
      impactDescription: 'Sequesters 25 tons of CO2 per hectare annually while providing coastal protection and biodiversity habitat.'
    },
    {
      id: 'project-2',
      projectTitle: 'Seagrass Meadow Conservation',
      ngoName: 'Coastal Conservation Alliance',
      ngoAddress: FIXED_WALLETS.NGO,
      location: 'Great Barrier Reef, Australia',
      projectType: 'Blue Carbon - Seagrass Protection',
      creditsAvailable: 750,
      pricePerCredit: 0.0015, // ETH
      certificationBody: 'Gold Standard',
      vintage: '2024',
      projectDescription: 'Protection and restoration of 300 hectares of seagrass meadows in marine protected areas.',
      impactDescription: 'Each hectare stores 83 tons of CO2 while supporting marine biodiversity and fish nursery habitats.'
    }
  ];

  useEffect(() => {
    setListings(sampleListings);
    loadWalletBalances();
    // Make debug functions available globally
    setupDebugFunctions();
  }, []);

  // Setup global debug functions
  const setupDebugFunctions = () => {
    (window as any).debugBlockchain = async () => {
      console.log('🔍 === BLOCKCHAIN DEBUG STARTED ===');
      
      try {
        // Setup provider and contract
        const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.NETWORK_CONFIG.rpcUrls[0]);
        const tokenContract = new ethers.Contract(
          BLOCKCHAIN_CONFIG.TOKEN_ADDRESS,
          BLOCKCHAIN_CONFIG.TOKEN_ABI,
          provider
        );
        
        console.log('📋 Configuration:');
        console.log('Contract Address:', BLOCKCHAIN_CONFIG.TOKEN_ADDRESS);
        console.log('Network:', BLOCKCHAIN_CONFIG.NETWORK_CONFIG.chainName);
        console.log('Company Wallet:', FIXED_WALLETS.COMPANY);
        console.log('NGO Wallet:', FIXED_WALLETS.NGO);
        
        console.log('\n👑 Checking Contract Ownership...');
        const contractOwner = await tokenContract.owner();
        const isOwner = contractOwner.toLowerCase() === FIXED_WALLETS.COMPANY.toLowerCase();
        
        console.log('Contract Owner:', contractOwner);
        console.log('Company Wallet:', FIXED_WALLETS.COMPANY);
        console.log('Is Company Owner?', isOwner);
        
        console.log('\n💰 Checking Balances...');
        const companyTokenBalance = await tokenContract.balanceOf(FIXED_WALLETS.COMPANY);
        const companyETHBalance = await provider.getBalance(FIXED_WALLETS.COMPANY);
        
        console.log('Company BCC Balance:', ethers.formatEther(companyTokenBalance));
        console.log('Company ETH Balance:', ethers.formatEther(companyETHBalance));
        
        console.log('\n📜 Contract Info...');
        const tokenName = await tokenContract.name();
        const tokenSymbol = await tokenContract.symbol();
        console.log('Token Name:', tokenName);
        console.log('Token Symbol:', tokenSymbol);
        
        console.log('\n🧪 Testing Mint Function...');
        try {
          // Try to estimate gas for minting (this will fail if permissions are wrong)
          const testAmount = ethers.parseEther('1');
          const gasEstimate = await tokenContract.mint.estimateGas(FIXED_WALLETS.COMPANY, testAmount);
          console.log('✅ Mint Gas Estimate:', gasEstimate.toString());
          console.log('✅ Minting permissions: WORKING');
        } catch (mintError: any) {
          console.log('❌ Mint Test Failed:', mintError.message);
          if (mintError.message.includes('Ownable: caller is not the owner')) {
            console.log('🚫 Issue: Company wallet is not the contract owner');
          }
        }
        
        console.log('\n✅ === DEBUG COMPLETE ===');
        
        return {
          contractAddress: BLOCKCHAIN_CONFIG.TOKEN_ADDRESS,
          contractOwner,
          companyWallet: FIXED_WALLETS.COMPANY,
          isOwner,
          companyBCCBalance: ethers.formatEther(companyTokenBalance),
          companyETHBalance: ethers.formatEther(companyETHBalance),
          tokenName,
          tokenSymbol
        };
        
      } catch (error: any) {
        console.error('❌ Debug failed:', error);
        return { error: error.message };
      }
    };

    (window as any).checkBalances = async () => {
      console.log('💰 Checking wallet balances...');
      
      try {
        const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.NETWORK_CONFIG.rpcUrls[0]);
        const tokenContract = new ethers.Contract(
          BLOCKCHAIN_CONFIG.TOKEN_ADDRESS,
          BLOCKCHAIN_CONFIG.TOKEN_ABI,
          provider
        );
        
        const companyTokenBalance = await tokenContract.balanceOf(FIXED_WALLETS.COMPANY);
        const companyETHBalance = await provider.getBalance(FIXED_WALLETS.COMPANY);
        const ngoETHBalance = await provider.getBalance(FIXED_WALLETS.NGO);
        
        console.log('📊 Current Balances:');
        console.log('Company BCC:', ethers.formatEther(companyTokenBalance));
        console.log('Company ETH:', ethers.formatEther(companyETHBalance));
        console.log('NGO ETH:', ethers.formatEther(ngoETHBalance));
        
        return {
          companyBCC: ethers.formatEther(companyTokenBalance),
          companyETH: ethers.formatEther(companyETHBalance),
          ngoETH: ethers.formatEther(ngoETHBalance)
        };
        
      } catch (error: any) {
        console.error('❌ Balance check failed:', error);
        return { error: error.message };
      }
    };

    console.log('🎯 Debug tools loaded!');
    console.log('Run: window.debugBlockchain() - Full blockchain debug');
    console.log('Run: window.checkBalances() - Quick balance check');
  };

  const loadWalletBalances = async () => {
    try {
      const ethBal = await tokenTransferService.getETHBalance(FIXED_WALLETS.COMPANY);
      const tokenBal = await tokenTransferService.getTokenBalance(FIXED_WALLETS.COMPANY);
      setEthBalance(ethBal);
      setTokenBalance(tokenBal);
    } catch (error) {
      console.error('Failed to load balances:', error);
    }
  };

  const handlePurchase = async (listing: CarbonListing, quantity: number) => {
    if (quantity <= 0 || quantity > listing.creditsAvailable) {
      alert('Invalid quantity');
      return;
    }

    setPurchasing(listing.id);
    
    try {
      const totalPrice = (quantity * listing.pricePerCredit).toString();
      
      // Pre-flight checks
      try {
        await WalletHelper.ensureCorrectWallet(FIXED_WALLETS.COMPANY, 'Company');
        await WalletHelper.ensureSepoliaNetwork();
      } catch (error: any) {
        alert(`❌ Wallet setup failed: ${error.message}`);
        return;
      }

      // Execute purchase
      const result = await tokenTransferService.transferCreditsToCompany(
        listing.ngoAddress,
        FIXED_WALLETS.COMPANY,
        quantity,
        totalPrice
      );
      
      if (result.success) {
        // Show success message with transaction details
        const message = result.message || `✅ Successfully purchased ${quantity} carbon credits!`;
        alert(message);
        
        // Update UI
        setListings(prev => prev.map(l => 
          l.id === listing.id 
            ? { ...l, creditsAvailable: l.creditsAvailable - quantity }
            : l
        ));
        
        // Refresh balances
        await loadWalletBalances();
      } else {
        alert(`❌ Purchase failed: ${result.error}`);
      }

    } catch (error: any) {
      console.error('Purchase error:', error);
      alert(`❌ Purchase failed: ${error.message}`);
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
                            <span>Vintage: {listing.vintage}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{listing.certificationBody}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {listing.projectDescription}
                          </p>
                        </div>

                        {/* Impact & Pricing */}
                        <div className="space-y-3">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-1">Environmental Impact</h4>
                            <p className="text-sm text-blue-700">{listing.impactDescription}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Price per Credit:</span>
                            <span className="font-bold text-lg">{listing.pricePerCredit} ETH</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Available:</span>
                            <span className="font-semibold">{listing.creditsAvailable} credits</span>
                          </div>
                        </div>

                        {/* Purchase Interface */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Quantity</label>
                            <Input
                              type="number"
                              min="1"
                              max={listing.creditsAvailable}
                              defaultValue="1"
                              id={`quantity-${listing.id}`}
                              className="w-full"
                            />
                          </div>
                          
                          <Button
                            onClick={() => {
                              const input = document.getElementById(`quantity-${listing.id}`) as HTMLInputElement;
                              const quantity = parseInt(input.value) || 1;
                              handlePurchase(listing, quantity);
                            }}
                            disabled={purchasing === listing.id || listing.creditsAvailable === 0}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            {purchasing === listing.id ? (
                              <>
                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Buy Credits
                              </>
                            )}
                          </Button>
                          
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