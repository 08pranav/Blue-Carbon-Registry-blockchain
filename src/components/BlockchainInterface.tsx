import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Coins,
  Wallet,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  Copy,
  Eye,
  Zap,
  Shield,
  Database,
  Link as LinkIcon,
  TrendingUp,
  Activity,
  RefreshCw,
  Award,
  Gem,
  Lock,
  Unlock
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BlockchainTransaction {
  id: string;
  type: 'MINT' | 'TRANSFER' | 'RETIRE';
  projectId: string;
  projectName: string;
  carbonAmount: number;
  txHash: string;
  blockNumber?: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  timestamp: string;
  gasUsed?: number;
  gasPrice?: string;
  from?: string;
  to?: string;
}

interface CarbonCredit {
  id: string;
  tokenId: string;
  projectId: string;
  projectName: string;
  carbonAmount: number;
  vintage: number;
  status: 'ACTIVE' | 'RETIRED' | 'TRANSFERRED';
  owner: string;
  mintedAt: string;
  retiredAt?: string;
  txHash: string;
  metadata: {
    ecosystem: string;
    location: string;
    methodology: string;
    verificationDate: string;
  };
}

interface SmartContractInfo {
  registryAddress: string;
  creditsAddress: string;
  network: string;
  chainId: number;
  totalProjects: number;
  totalCredits: number;
  totalRetired: number;
}

interface BlockchainInterfaceProps {
  className?: string;
}

export function BlockchainInterface({ className }: BlockchainInterfaceProps) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [contractInfo, setContractInfo] = useState<SmartContractInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [mintingCredit, setMintingCredit] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [mintVintage, setMintVintage] = useState(new Date().getFullYear().toString());
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
  const [showMintDialog, setShowMintDialog] = useState(false);
  const [showCreditDialog, setShowCreditDialog] = useState(false);

  useEffect(() => {
    fetchBlockchainData();
  }, []);

  const fetchBlockchainData = async () => {
    setLoading(true);
    try {
      // Mock blockchain data since we don't have real blockchain integration yet
      setTransactions([
        {
          id: 'tx-1',
          type: 'MINT',
          projectId: 'proj-1',
          projectName: 'Sundarbans Mangrove Restoration',
          carbonAmount: 1000,
          txHash: '0x1234567890abcdef1234567890abcdef12345678',
          blockNumber: 12345678,
          status: 'CONFIRMED',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          gasUsed: 21000,
          gasPrice: '20'
        },
        {
          id: 'tx-2',
          type: 'TRANSFER',
          projectId: 'proj-1',
          projectName: 'Sundarbans Mangrove Restoration',
          carbonAmount: 500,
          txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
          blockNumber: 12345679,
          status: 'CONFIRMED',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          gasUsed: 18000,
          gasPrice: '22',
          from: '0x1234...5678',
          to: '0xabcd...ef12'
        }
      ]);

      setCredits([
        {
          id: 'credit-1',
          tokenId: '1',
          projectId: 'proj-1',
          projectName: 'Sundarbans Mangrove Restoration',
          carbonAmount: 1000,
          vintage: 2024,
          status: 'ACTIVE',
          owner: user?.id || 'current-user',
          mintedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          txHash: '0x1234567890abcdef1234567890abcdef12345678',
          metadata: {
            ecosystem: 'Mangrove',
            location: 'Sundarbans, West Bengal',
            methodology: 'Verified Carbon Standard',
            verificationDate: new Date().toISOString()
          }
        }
      ]);

      setContractInfo({
        registryAddress: '0x1234567890abcdef1234567890abcdef12345678',
        creditsAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        network: 'Polygon Mumbai Testnet',
        chainId: 80001,
        totalProjects: 156,
        totalCredits: 45000,
        totalRetired: 12000
      });

    } catch (error) {
      console.error('Error fetching blockchain data:', error);
      toast.error('Failed to fetch blockchain data');
    } finally {
      setLoading(false);
    }
  };

  const handleMintCredits = async () => {
    if (!selectedProject || !mintAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setMintingCredit(true);
    try {
      // Mock minting process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newCredit: CarbonCredit = {
        id: `credit-${Date.now()}`,
        tokenId: (credits.length + 1).toString(),
        projectId: selectedProject,
        projectName: 'New Project',
        carbonAmount: parseInt(mintAmount),
        vintage: parseInt(mintVintage),
        status: 'ACTIVE',
        owner: user?.id || 'current-user',
        mintedAt: new Date().toISOString(),
        txHash: `0x${Math.random().toString(16).substr(2, 40)}`,
        metadata: {
          ecosystem: 'Mangrove',
          location: 'Various Locations',
          methodology: 'Verified Carbon Standard',
          verificationDate: new Date().toISOString()
        }
      };

      setCredits(prev => [...prev, newCredit]);
      setShowMintDialog(false);
      setSelectedProject('');
      setMintAmount('');
      toast.success(`Successfully minted ${mintAmount} carbon credits!`);
      
    } catch (error) {
      console.error('Error minting credits:', error);
      toast.error('Failed to mint carbon credits');
    } finally {
      setMintingCredit(false);
    }
  };

  const handleRetireCredit = async (creditId: string) => {
    try {
      const creditIndex = credits.findIndex(c => c.id === creditId);
      if (creditIndex !== -1) {
        const updatedCredits = [...credits];
        updatedCredits[creditIndex] = {
          ...updatedCredits[creditIndex],
          status: 'RETIRED',
          retiredAt: new Date().toISOString()
        };
        setCredits(updatedCredits);
        toast.success('Carbon credit retired successfully');
      }
    } catch (error) {
      console.error('Error retiring credit:', error);
      toast.error('Failed to retire carbon credit');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'FAILED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'RETIRED':
        return <Lock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'ACTIVE':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'FAILED':
        return 'destructive';
      case 'RETIRED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'AUDITOR')) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Blockchain interface is only available for Admin and Auditor roles.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="h-6 w-6 text-purple-600" />
            Blockchain Integration
          </h2>
          <p className="text-gray-600">Manage carbon credit NFTs and blockchain transactions</p>
        </div>
        
        <Button onClick={fetchBlockchainData} variant="outline" disabled={loading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Smart Contract Info */}
      {contractInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Smart Contract Information
            </CardTitle>
            <CardDescription>
              Deployed contracts on {contractInfo.network}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Registry Contract</Label>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {formatAddress(contractInfo.registryAddress)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(contractInfo.registryAddress)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Credits Contract</Label>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {formatAddress(contractInfo.creditsAddress)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(contractInfo.creditsAddress)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Network</Label>
                <Badge variant="outline">{contractInfo.network}</Badge>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Chain ID</Label>
                <Badge variant="secondary">{contractInfo.chainId}</Badge>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Projects</p>
                    <p className="text-2xl font-bold text-blue-900">{contractInfo.totalProjects}</p>
                  </div>
                  <Database className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Total Credits</p>
                    <p className="text-2xl font-bold text-green-900">{contractInfo.totalCredits.toLocaleString()}</p>
                  </div>
                  <Coins className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Retired Credits</p>
                    <p className="text-2xl font-bold text-purple-900">{contractInfo.totalRetired.toLocaleString()}</p>
                  </div>
                  <Lock className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="credits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credits">Carbon Credits</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="mint">Mint Credits</TabsTrigger>
        </TabsList>

        {/* Carbon Credits Tab */}
        <TabsContent value="credits" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Carbon Credit NFTs</h3>
            <Badge variant="outline">{credits.length} Credits</Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {credits.map((credit) => (
              <Card key={credit.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm">Token #{credit.tokenId}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        {credit.projectName}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(credit.status)}>
                      {getStatusIcon(credit.status)}
                      <span className="ml-1">{credit.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Carbon Amount</p>
                      <p className="font-semibold">{credit.carbonAmount.toLocaleString()} tCO₂</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Vintage</p>
                      <p className="font-semibold">{credit.vintage}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <p>Ecosystem: {credit.metadata.ecosystem}</p>
                    <p>Location: {credit.metadata.location}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCredit(credit);
                        setShowCreditDialog(true);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    
                    {credit.status === 'ACTIVE' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetireCredit(credit.id)}
                      >
                        <Lock className="h-3 w-3 mr-1" />
                        Retire
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {credits.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Carbon Credits</h3>
                <p className="text-gray-600">
                  No carbon credit NFTs have been minted yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Blockchain Transactions</h3>
            <Badge variant="outline">{transactions.length} Transactions</Badge>
          </div>
          
          <div className="space-y-4">
            {transactions.map((tx) => (
              <Card key={tx.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(tx.status)}>
                        {getStatusIcon(tx.status)}
                        <span className="ml-1">{tx.type}</span>
                      </Badge>
                      <span className="font-medium">{tx.projectName}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(tx.timestamp).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <div className="font-medium">{tx.carbonAmount.toLocaleString()} tCO₂</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Block:</span>
                      <div className="font-medium">{tx.blockNumber?.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Gas Used:</span>
                      <div className="font-medium">{tx.gasUsed?.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Gas Price:</span>
                      <div className="font-medium">{tx.gasPrice} Gwei</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Tx Hash:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {formatAddress(tx.txHash)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(tx.txHash)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View on Explorer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {transactions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Transactions</h3>
                <p className="text-gray-600">
                  No blockchain transactions found.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Mint Credits Tab */}
        <TabsContent value="mint" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Mint Carbon Credits
              </CardTitle>
              <CardDescription>
                Create new carbon credit NFTs for verified projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project">Select Project</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose verified project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proj-1">Sundarbans Mangrove Restoration</SelectItem>
                      <SelectItem value="proj-2">Kerala Seagrass Conservation</SelectItem>
                      <SelectItem value="proj-3">Gujarat Salt Marsh Protection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="amount">Carbon Amount (tCO₂)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    placeholder="1000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="vintage">Vintage Year</Label>
                  <Input
                    id="vintage"
                    type="number"
                    min="2020"
                    max="2030"
                    value={mintVintage}
                    onChange={(e) => setMintVintage(e.target.value)}
                  />
                </div>
              </div>
              
              <Button
                onClick={() => setShowMintDialog(true)}
                disabled={!selectedProject || !mintAmount}
                className="w-full md:w-auto"
              >
                <Coins className="h-4 w-4 mr-2" />
                Mint Carbon Credits
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mint Confirmation Dialog */}
      <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Credit Minting</DialogTitle>
            <DialogDescription>
              This will create new carbon credit NFTs on the blockchain
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">{mintAmount} tCO₂</span>
              </div>
              <div className="flex justify-between">
                <span>Vintage:</span>
                <span className="font-medium">{mintVintage}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Gas:</span>
                <span className="font-medium">~0.05 MATIC</span>
              </div>
            </div>
            
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                This action will create immutable NFT tokens on the blockchain. 
                Make sure all details are correct before proceeding.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMintDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMintCredits} disabled={mintingCredit}>
              {mintingCredit ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Minting...
                </>
              ) : (
                <>
                  <Coins className="h-4 w-4 mr-2" />
                  Mint Credits
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credit Detail Dialog */}
      {selectedCredit && (
        <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Carbon Credit NFT #{selectedCredit.tokenId}
              </DialogTitle>
              <DialogDescription>
                {selectedCredit.projectName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Carbon Amount</Label>
                  <p className="text-lg font-bold">{selectedCredit.carbonAmount.toLocaleString()} tCO₂</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge variant={getStatusColor(selectedCredit.status)}>
                    {selectedCredit.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Vintage</Label>
                  <p className="font-medium">{selectedCredit.vintage}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Minted</Label>
                  <p className="font-medium">{new Date(selectedCredit.mintedAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Metadata</Label>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                  <div><strong>Ecosystem:</strong> {selectedCredit.metadata.ecosystem}</div>
                  <div><strong>Location:</strong> {selectedCredit.metadata.location}</div>
                  <div><strong>Methodology:</strong> {selectedCredit.metadata.methodology}</div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Transaction Hash</Label>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1">
                    {formatAddress(selectedCredit.txHash)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(selectedCredit.txHash)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreditDialog(false)}>
                Close
              </Button>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}