import CarbonCreditsTracker from "@/components/CarbonCreditsTracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Leaf, 
  Clock,
  Search,
  Filter,
  ExternalLink
} from "lucide-react";
import { useState } from "react";

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const marketData = {
    totalVolume: "₹45.2M",
    averagePrice: "₹850",
    dailyChange: "+12.5%",
    activeListings: 47
  };

  const creditListings = [
    {
      id: "CC-001",
      projectName: "Sundarbans Mangrove Restoration",
      credits: 1000,
      pricePerCredit: 850,
      totalPrice: 850000,
      vintage: "2024",
      certification: "NCCR Verified",
      location: "West Bengal",
      seller: "Sundarbans Foundation",
      listedDate: "2024-09-20",
      status: "available"
    },
    {
      id: "CC-002", 
      projectName: "Kerala Backwater Seagrass",
      credits: 500,
      pricePerCredit: 920,
      totalPrice: 460000,
      vintage: "2024",
      certification: "NCCR Verified",
      location: "Kerala",
      seller: "Coastal Guard NGO",
      listedDate: "2024-09-18",
      status: "available"
    },
    {
      id: "CC-003",
      projectName: "Gujarat Salt Marsh Recovery",
      credits: 2500,
      pricePerCredit: 780,
      totalPrice: 1950000,
      vintage: "2023",
      certification: "NCCR Verified", 
      location: "Gujarat",
      seller: "Marine Conservation Trust",
      listedDate: "2024-09-15",
      status: "available"
    }
  ];

  const recentTransactions = [
    {
      id: "TX-001",
      projectName: "Odisha Mangrove Project",
      credits: 750,
      price: 820,
      buyer: "Green Energy Corp",
      date: "2024-09-22",
      status: "completed"
    },
    {
      id: "TX-002",
      projectName: "Tamil Nadu Seagrass",
      credits: 300,
      price: 895,
      buyer: "EcoTech Solutions",
      date: "2024-09-21",
      status: "completed"
    }
  ];

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
          </div>

          {/* Market Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketData.totalVolume}</div>
                <p className="text-xs text-muted-foreground">30-day trading volume</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketData.averagePrice}</div>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {marketData.dailyChange} today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                <Leaf className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketData.activeListings}</div>
                <p className="text-xs text-muted-foreground">Available for purchase</p>
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

      {/* Marketplace Content */}
      <section className="py-8 px-4">
        <div className="mx-auto max-w-7xl">
          <Tabs defaultValue="buy" className="space-y-8">
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
                    <div className="flex gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Vintage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Years</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All States</SelectItem>
                          <SelectItem value="west-bengal">West Bengal</SelectItem>
                          <SelectItem value="kerala">Kerala</SelectItem>
                          <SelectItem value="gujarat">Gujarat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Credit Listings */}
              <div className="space-y-4">
                {creditListings.map((listing) => (
                  <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{listing.projectName}</h3>
                            <Badge variant="outline">{listing.certification}</Badge>
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Credits Available</div>
                              <div className="font-medium">{listing.credits.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Price per Credit</div>
                              <div className="font-medium">₹{listing.pricePerCredit}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Location</div>
                              <div className="font-medium">{listing.location}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Vintage</div>
                              <div className="font-medium">{listing.vintage}</div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Seller: {listing.seller} • Listed: {new Date(listing.listedDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <div className="text-2xl font-bold">₹{listing.totalPrice.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Total Price</div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Project
                            </Button>
                            <Button>Purchase Credits</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sell" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>List Your Carbon Credits</CardTitle>
                  <CardDescription>
                    Sell your verified blue carbon credits on the marketplace
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Leaf className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground mb-4">
                      Credit listing functionality will be available once your projects are verified
                      and carbon credits are tokenized on the blockchain.
                    </p>
                    <Button variant="outline">
                      Learn More About Selling
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Latest carbon credit transactions on the marketplace
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{transaction.projectName}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.credits} credits • Buyer: {transaction.buyer}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{(transaction.credits * transaction.price).toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">₹{transaction.price}/credit</div>
                          <Badge variant="default" className="mt-1">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
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