import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, type MarketplaceListing, type MarketStats, type Transaction } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Leaf,
  BarChart3,
  MapPin,
  Calendar,
  Shield,
  Star,
  Filter,
  Search,
  Eye,
  CheckCircle,
  Clock,
  Globe,
  Building2,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MarketplaceProps {
  className?: string;
}

interface PurchaseDialogData {
  listing: MarketplaceListing | null;
  quantity: number;
  paymentMethod: string;
}

export function MarketplaceInterface({ className }: MarketplaceProps) {
  const { user } = useAuth();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ecosystemFilter, setEcosystemFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [purchaseData, setPurchaseData] = useState<PurchaseDialogData>({
    listing: null,
    quantity: 0,
    paymentMethod: 'bank_transfer'
  });
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    setLoading(true);
    try {
      const [listingsResponse, transactionsResponse] = await Promise.all([
        apiService.getMarketplaceListings(),
        apiService.getTransactions({ role: user?.role, userId: user?.id })
      ]);
      
      setListings(listingsResponse.listings);
      setMarketStats(listingsResponse.marketStats);
      setTransactions(transactionsResponse.transactions);
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      toast.error('Failed to fetch marketplace data');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (listing: MarketplaceListing) => {
    setPurchaseData({
      listing,
      quantity: Math.min(10, listing.credits), // Default to min of 10 or available
      paymentMethod: 'bank_transfer'
    });
    setShowPurchaseDialog(true);
  };

  const submitPurchase = async () => {
    if (!purchaseData.listing || !user) return;

    setPurchasing(true);
    try {
      const response = await apiService.purchaseCredits({
        listingId: purchaseData.listing.id,
        quantity: purchaseData.quantity,
        buyerId: user.id,
        buyerName: user.name,
        paymentMethod: purchaseData.paymentMethod
      });

      toast.success(`Successfully purchased ${purchaseData.quantity} carbon credits!`);
      setShowPurchaseDialog(false);
      
      // Refresh data
      await fetchMarketplaceData();
    } catch (error) {
      console.error('Error purchasing credits:', error);
      toast.error('Failed to purchase credits. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const retireCredits = async (transactionId: string) => {
    try {
      await apiService.retireCredits(transactionId);
      toast.success('Carbon credits retired successfully!');
      await fetchMarketplaceData();
    } catch (error) {
      console.error('Error retiring credits:', error);
      toast.error('Failed to retire credits. Please try again.');
    }
  };

  const getCertificationColor = (certification: string) => {
    switch (certification.toLowerCase()) {
      case 'gold standard': return 'bg-yellow-500';
      case 'verified carbon standard': return 'bg-blue-500';
      case 'plan vivo': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = 
      listing.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.seller.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEcosystem = ecosystemFilter === 'all' || 
      listing.ecosystem.toLowerCase() === ecosystemFilter.toLowerCase();
    
    const matchesPrice = priceFilter === 'all' ||
      (priceFilter === 'under_25' && listing.pricePerCredit < 25) ||
      (priceFilter === '25_50' && listing.pricePerCredit >= 25 && listing.pricePerCredit < 50) ||
      (priceFilter === 'over_50' && listing.pricePerCredit >= 50);
    
    return matchesSearch && matchesEcosystem && matchesPrice;
  });

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-green-600" />
            Blue Carbon Marketplace
          </h2>
          <p className="text-gray-600">Trade verified blue carbon credits from restoration projects</p>
        </div>
        
        <Button onClick={fetchMarketplaceData} variant="outline" disabled={loading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Market Statistics */}
      {marketStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Volume</p>
                  <p className="text-2xl font-bold">{marketStats.totalVolume.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">tCO₂ traded</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Price</p>
                  <p className="text-2xl font-bold">${marketStats.averagePrice}</p>
                  <p className="text-xs text-gray-500">per tCO₂</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold">{marketStats.activeListings}</p>
                  <p className="text-xs text-gray-500">available now</p>
                </div>
                <Globe className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Daily Change</p>
                  <p className="text-2xl font-bold text-green-600">{marketStats.dailyChange}</p>
                  <p className="text-xs text-gray-500">vs yesterday</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Credits</TabsTrigger>
          <TabsTrigger value="transactions">My Transactions</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        {/* Browse Credits Tab */}
        <TabsContent value="browse" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search projects, locations, or sellers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={ecosystemFilter} onValueChange={setEcosystemFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ecosystems</SelectItem>
                    <SelectItem value="mangrove">Mangrove</SelectItem>
                    <SelectItem value="seagrass">Seagrass</SelectItem>
                    <SelectItem value="saltmarsh">Salt Marsh</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="under_25">Under $25</SelectItem>
                    <SelectItem value="25_50">$25 - $50</SelectItem>
                    <SelectItem value="over_50">Over $50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Listings Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{listing.projectName}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {listing.location}
                      </CardDescription>
                    </div>
                    <div className={cn('w-3 h-3 rounded-full', getCertificationColor(listing.certification))}></div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Available Credits</p>
                      <p className="font-semibold">{listing.credits.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Price per Credit</p>
                      <p className="font-semibold text-green-600">${listing.pricePerCredit}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Vintage</p>
                      <p className="font-semibold">{listing.vintage}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Area</p>
                      <p className="font-semibold">{listing.area} ha</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs">
                        {listing.ecosystem}
                      </Badge>
                      <p className="text-xs text-gray-500">by {listing.seller}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {user?.role === 'BUYER' && (
                        <Button size="sm" onClick={() => handlePurchase(listing)}>
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Buy
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Listings Found</h3>
                <p className="text-gray-600">
                  No carbon credit listings match your current filters.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* My Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{transaction.projectName}</h4>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Credits:</span> {transaction.credits.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Price:</span> ${transaction.pricePerCredit}/tCO₂
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> ${transaction.totalAmount.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {new Date(transaction.transactionDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant={transaction.status === 'COMPLETED' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                        {transaction.carbonCreditsRetired ? (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Retired
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {!transaction.carbonCreditsRetired && user?.role === 'BUYER' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => retireCredits(transaction.id)}
                        >
                          Retire Credits
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Transactions</h3>
                <p className="text-gray-600">
                  You haven't made any carbon credit transactions yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Credits Owned</p>
                    <p className="text-2xl font-bold">
                      {transactions.reduce((sum, tx) => tx.carbonCreditsRetired ? sum : sum + tx.credits, 0).toLocaleString()}
                    </p>
                  </div>
                  <Leaf className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Credits Retired</p>
                    <p className="text-2xl font-bold">
                      {transactions.reduce((sum, tx) => tx.carbonCreditsRetired ? sum + tx.credits : sum, 0).toLocaleString()}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Investment</p>
                    <p className="text-2xl font-bold">
                      ${transactions.reduce((sum, tx) => sum + tx.totalAmount, 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Purchase Carbon Credits</DialogTitle>
            <DialogDescription>
              {purchaseData.listing?.projectName}
            </DialogDescription>
          </DialogHeader>

          {purchaseData.listing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Available Credits</Label>
                  <p className="font-semibold">{purchaseData.listing.credits.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Price per Credit</Label>
                  <p className="font-semibold text-green-600">${purchaseData.listing.pricePerCredit}</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity to Purchase</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={purchaseData.listing.credits}
                  value={purchaseData.quantity}
                  onChange={(e) => setPurchaseData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Payment Method</Label>
                <Select 
                  value={purchaseData.paymentMethod} 
                  onValueChange={(value) => setPurchaseData(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-xl font-bold text-green-600">
                    ${(purchaseData.quantity * purchaseData.listing.pricePerCredit).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchaseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitPurchase} disabled={purchasing || purchaseData.quantity <= 0}>
              {purchasing ? 'Processing...' : `Purchase ${purchaseData.quantity} Credits`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}