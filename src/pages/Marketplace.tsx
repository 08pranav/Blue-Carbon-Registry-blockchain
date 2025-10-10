import { useState, useEffect } from 'react';
import { useRoleAuth } from '@/contexts/RoleAuthContext';
import { apiService, type MarketplaceListing, type MarketStats, type Transaction } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Leaf, 
  Clock,
  Search,
  Filter,
  ExternalLink,
  ShoppingCart,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Calendar,
  Building,
  CreditCard,
  Wallet,
  ArrowUpDown,
  Eye,
  Download
} from "lucide-react";
import { toast } from "sonner";
import CarbonCreditsTracker from "@/components/CarbonCreditsTracker";

const Marketplace = () => {
  const { authState } = useRoleAuth();
  const { user } = authState;
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("buy");

  // Fetch marketplace data
  const fetchMarketplaceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getMarketplaceListings();
      setListings(response.listings);
      setMarketStats(response.marketStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch marketplace data');
      console.error('Error fetching marketplace data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    if (!user) return;
    
    setTransactionsLoading(true);
    try {
      const response = await apiService.getTransactions({
        userId: user.id,
        role: user.role
      });
      setTransactions(response.transactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchTransactions();
    }
  }, [activeTab, user]);

  // Filter listings
  const filteredListings = listings.filter(listing => 
    (listing.projectName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (listing.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (listing.seller || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePurchase = async () => {
    if (!selectedListing || !user) return;

    if (purchaseQuantity > selectedListing.credits) {
      toast.error('Quantity exceeds available credits');
      return;
    }

    setPurchaseLoading(true);
    try {
      const response = await apiService.purchaseCredits({
        listingId: selectedListing.id,
        quantity: purchaseQuantity,
        buyerId: user.id,
        buyerName: user.name,
        paymentMethod
      });

      toast.success('Purchase successful! Transaction completed.');
      
      // Refresh data
      fetchMarketplaceData();
      if (activeTab === 'history') {
        fetchTransactions();
      }
      
      // Reset form
      setSelectedListing(null);
      setPurchaseQuantity(1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Purchase failed');
      console.error('Error processing purchase:', err);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleRetireCredits = async (transactionId: string) => {
    try {
      await apiService.retireCredits(transactionId);
      toast.success('Carbon credits retired successfully');
      fetchTransactions();
    } catch (err) {
      toast.error('Failed to retire credits');
      console.error('Error retiring credits:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getEcosystemColor = (ecosystem: string | undefined) => {
    if (!ecosystem) return 'bg-gray-100 text-gray-800';
    
    switch (ecosystem.toUpperCase()) {
      case 'MANGROVE': return 'bg-green-100 text-green-800';
      case 'SEAGRASS': return 'bg-blue-100 text-blue-800';
      case 'SALT_MARSH': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
              <h2 className="text-lg font-semibold mb-2">Login Required</h2>
              <p className="text-gray-600">Please log in to access the marketplace.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-background py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Carbon Credits Marketplace
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Trade verified blue carbon credits powered by blockchain technology. 
              All transactions are transparent, immutable, and instantly verifiable.
            </p>
            <div className="mt-6 flex justify-center">
              <Button 
                variant="outline" 
                onClick={fetchMarketplaceData}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Market Data
              </Button>
            </div>
          </div>

          {/* Market Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {marketStats ? formatCurrency(marketStats.totalVolume) : '₹0'}
                    </div>
                    <p className="text-xs text-muted-foreground">30-day trading volume</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {marketStats ? formatCurrency(marketStats.averagePrice) : '₹0'}
                    </div>
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {marketStats?.dailyChange || '+0%'} today
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                <Leaf className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{marketStats?.activeListings || 0}</div>
                    <p className="text-xs text-muted-foreground">Available for purchase</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Market Status</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Open</div>
                <p className="text-xs text-muted-foreground">24/7 trading</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Carbon Credits Tracker */}
      <section className="py-8">
        <CarbonCreditsTracker />
      </section>

      {/* Error State */}
      {error && (
        <section className="px-4">
          <div className="mx-auto max-w-7xl">
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchMarketplaceData}
                  className="ml-2"
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </section>
      )}

      {/* Marketplace Content */}
      <section className="py-8 px-4">
        <div className="mx-auto max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="buy">Buy Credits</TabsTrigger>
              <TabsTrigger value="sell">Sell Credits</TabsTrigger>
              <TabsTrigger value="history">Transaction History</TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Browse Available Credits</CardTitle>
                  <CardDescription>Find and purchase verified blue carbon credits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by project, location, or seller..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Listings Grid */}
              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3 mb-4" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                        <Skeleton className="h-10 w-full mt-4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredListings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Leaf className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Credits Available</h3>
                    <p className="text-gray-600">
                      {listings.length === 0 
                        ? 'No verified projects have carbon credits available for sale yet.' 
                        : 'No credits match your search criteria. Try adjusting your filters.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredListings.map((listing) => (
                    <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-lg line-clamp-2">{listing.projectName}</h3>
                          <Badge className={getEcosystemColor(listing.ecosystem)}>
                            {listing.ecosystem}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{listing.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            <span>{listing.seller}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Vintage {listing.vintage}</span>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Available:</span>
                            <span className="font-medium">{listing.credits.toLocaleString()} credits</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Price per credit:</span>
                            <span className="font-medium">{formatCurrency(listing.pricePerCredit)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total value:</span>
                            <span className="font-bold text-lg">{formatCurrency(listing.totalPrice)}</span>
                          </div>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full" 
                              onClick={() => setSelectedListing(listing)}
                              disabled={user.role !== 'BUYER'}
                            >
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              {user.role === 'BUYER' ? 'Purchase Credits' : 'Buyers Only'}
                            </Button>
                          </DialogTrigger>
                          
                          {selectedListing?.id === listing.id && (
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Purchase Carbon Credits</DialogTitle>
                                <DialogDescription>
                                  Complete your purchase of verified blue carbon credits
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm font-medium">Project</Label>
                                  <p className="text-sm text-gray-600">{selectedListing.projectName}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input
                                      id="quantity"
                                      type="number"
                                      min="1"
                                      max={selectedListing.credits}
                                      value={purchaseQuantity}
                                      onChange={(e) => setPurchaseQuantity(parseInt(e.target.value) || 1)}
                                    />
                                  </div>
                                  <div>
                                    <Label>Total Price</Label>
                                    <div className="text-lg font-bold">
                                      {formatCurrency(purchaseQuantity * selectedListing.pricePerCredit)}
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label htmlFor="payment">Payment Method</Label>
                                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                                      <SelectItem value="wallet">Digital Wallet</SelectItem>
                                      <SelectItem value="bank">Bank Transfer</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <Button 
                                  onClick={handlePurchase}
                                  disabled={purchaseLoading}
                                  className="w-full"
                                >
                                  {purchaseLoading ? (
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <CreditCard className="mr-2 h-4 w-4" />
                                  )}
                                  {purchaseLoading ? 'Processing...' : 'Complete Purchase'}
                                </Button>
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sell" className="space-y-6">
              <Card>
                <CardContent className="text-center py-12">
                  <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Sell Your Carbon Credits</h3>
                  <p className="text-gray-600 mb-6">
                    NGOs can sell their verified carbon credits directly through project verification.
                    Once your projects are verified, credits become available on the marketplace.
                  </p>
                  {user.role === 'NGO' ? (
                    <Button asChild>
                      <a href="/projects">
                        <Eye className="mr-2 h-4 w-4" />
                        View My Projects
                      </a>
                    </Button>
                  ) : (
                    <p className="text-sm text-gray-500">NGO role required to sell credits</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    View your carbon credit trading history and manage your portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-5 w-20" />
                          </div>
                          <Skeleton className="h-4 w-32 mb-2" />
                          <div className="grid grid-cols-3 gap-4">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <ArrowUpDown className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
                      <p className="text-gray-600">Your transaction history will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{transaction.projectName}</h4>
                            <Badge 
                              variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                            >
                              {transaction.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">
                            Transaction ID: {transaction.id}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Credits:</span>
                              <div>{transaction.credits.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="font-medium">Price:</span>
                              <div>{formatCurrency(transaction.pricePerCredit)}</div>
                            </div>
                            <div>
                              <span className="font-medium">Total:</span>
                              <div className="font-bold">{formatCurrency(transaction.totalAmount)}</div>
                            </div>
                            <div>
                              <span className="font-medium">Date:</span>
                              <div>{new Date(transaction.transactionDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <div className="text-xs text-gray-500">
                              Blockchain: {transaction.blockchainTxHash.slice(0, 10)}...
                            </div>
                            
                            <div className="flex gap-2">
                              {user.role === 'BUYER' && !transaction.carbonCreditsRetired && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRetireCredits(transaction.id)}
                                >
                                  Retire Credits
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View on Blockchain
                              </Button>
                            </div>
                          </div>
                          
                          {transaction.carbonCreditsRetired && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                              ✓ Credits retired on {new Date(transaction.retiredAt!).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Marketplace;