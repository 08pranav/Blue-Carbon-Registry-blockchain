import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Coins, 
  TrendingUp, 
  ArrowUpRight, 
  Leaf, 
  Shield, 
  CheckCircle,
  Clock,
  ExternalLink
} from "lucide-react";

const mockCarbonCredits = [
  {
    id: "CC-BC001-2024",
    projectId: "BC001",
    projectName: "Sundarbans Mangrove Restoration",
    totalCredits: 15420,
    availableCredits: 12340,
    soldCredits: 3080,
    pricePerCredit: 25.50,
    status: "active",
    verificationDate: "2024-01-20",
    expiryDate: "2034-01-20",
    blockchainHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
    vintage: 2024,
  },
  {
    id: "CC-BC003-2024",
    projectId: "BC003", 
    projectName: "Odisha Deltaic Restoration",
    totalCredits: 26850,
    availableCredits: 26850,
    soldCredits: 0,
    pricePerCredit: 28.75,
    status: "active",
    verificationDate: "2023-12-15",
    expiryDate: "2033-12-15",
    blockchainHash: "0x9876543210abcdef1234567890abcdef12345678",
    vintage: 2023,
  },
  {
    id: "CC-BC002-2024",
    projectId: "BC002",
    projectName: "Kerala Backwater Conservation", 
    totalCredits: 8740,
    availableCredits: 0,
    soldCredits: 0,
    pricePerCredit: 0,
    status: "pending",
    verificationDate: null,
    expiryDate: null,
    blockchainHash: null,
    vintage: 2024,
  },
];

const CarbonCreditsTracker = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-nature/10 text-nature border-nature/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="border-orange-200 text-orange-600">
            <Clock className="w-3 h-3 mr-1" />
            Pending Verification
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const totalMarketValue = mockCarbonCredits
    .filter(credit => credit.status === "active")
    .reduce((sum, credit) => sum + (credit.availableCredits * credit.pricePerCredit), 0);

  const totalActiveCredits = mockCarbonCredits
    .filter(credit => credit.status === "active")
    .reduce((sum, credit) => sum + credit.availableCredits, 0);

  return (
    <section className="py-20 bg-gradient-to-br from-background to-accent/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Coins className="w-4 h-4 mr-2" />
            Tokenized Carbon Credits
          </Badge>
          <h2 className="text-4xl font-bold mb-4">Carbon Credits Marketplace</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Blockchain-verified carbon credits from blue carbon ecosystem restoration
          </p>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-ecosystem text-white border-0 shadow-ocean">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Coins className="w-8 h-8" />
                <TrendingUp className="w-5 h-5 text-green-200" />
              </div>
              <div className="text-3xl font-bold mb-1">{totalActiveCredits.toLocaleString()}</div>
              <div className="text-blue-100">Available Credits</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-nature text-white border-0 shadow-nature">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">₹</span>
                <ArrowUpRight className="w-5 h-5 text-green-200" />
              </div>
              <div className="text-3xl font-bold mb-1">₹{(totalMarketValue * 83).toLocaleString()}</div>
              <div className="text-green-100">Market Value (INR)</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-8 h-8 text-ocean" />
                <span className="text-sm text-nature font-semibold">+12%</span>
              </div>
              <div className="text-3xl font-bold mb-1 text-foreground">$27.15</div>
              <div className="text-muted-foreground">Avg. Price/Credit</div>
            </CardContent>
          </Card>
        </div>

        {/* Credits Cards */}
        <div className="space-y-6">
          {mockCarbonCredits.map((credit) => (
            <Card key={credit.id} className="bg-gradient-card border-0 shadow-elegant hover:shadow-ocean transition-all duration-300">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <Leaf className="w-6 h-6 text-nature" />
                      <span className="text-ocean font-mono">{credit.id}</span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {credit.projectName} • Vintage {credit.vintage}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    {getStatusBadge(credit.status)}
                    {credit.status === "active" && (
                      <div className="text-2xl font-bold text-nature">
                        ${credit.pricePerCredit}
                        <span className="text-sm text-muted-foreground ml-1">/credit</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {credit.status === "active" && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total Credits</div>
                      <div className="text-2xl font-bold text-foreground">{credit.totalCredits.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Available for Sale</div>
                      <div className="text-2xl font-bold text-nature">{credit.availableCredits.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Credits Sold</div>
                      <div className="text-2xl font-bold text-ocean">{credit.soldCredits.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Credits Utilization</span>
                      <span className="text-sm font-semibold">
                        {Math.round((credit.soldCredits / credit.totalCredits) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(credit.soldCredits / credit.totalCredits) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Verification Date</div>
                      <div className="font-semibold">{new Date(credit.verificationDate!).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Expiry Date</div>
                      <div className="font-semibold">{new Date(credit.expiryDate!).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-sm text-muted-foreground mb-2">Blockchain Hash</div>
                    <div className="font-mono text-sm bg-muted p-2 rounded border break-all">
                      {credit.blockchainHash}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1 bg-gradient-nature hover:shadow-nature transition-all duration-300">
                      <Coins className="w-4 h-4 mr-2" />
                      Purchase Credits
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Blockchain
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Shield className="w-4 h-4 mr-2" />
                      Verification Report
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CarbonCreditsTracker;