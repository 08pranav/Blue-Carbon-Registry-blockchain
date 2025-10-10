import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { useRoleAuth } from '@/contexts/RoleAuthContext';
import { 
  Building2, 
  Users, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ExternalLink,
  FileText,
  Coins,
  ShoppingCart,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export const BlockchainTransactions: React.FC = () => {
  const { authState } = useRoleAuth();
  const { user } = authState;
  const userRole = authState.role;
  const {
    isConnected,
    walletAddress,
    registerNGO,
    registerCompany,
    verifyNGO,
    executeTrade,
    getNGOByWallet
  } = useBlockchain();

  // NGO Registration State
  const [ngoData, setNgoData] = useState({
    name: '',
    documentsHash: ''
  });
  const [ngoLoading, setNgoLoading] = useState(false);

  // Company Registration State  
  const [companyData, setCompanyData] = useState({
    name: '',
    kycHash: ''
  });
  const [companyLoading, setCompanyLoading] = useState(false);

  // Verification State
  const [verificationData, setVerificationData] = useState({
    ngoId: '',
    creditsToAllocate: ''
  });
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Trade State
  const [tradeData, setTradeData] = useState({
    sellerAddress: '',
    amount: '',
    price: '',
    pdfHash: ''
  });
  const [tradeLoading, setTradeLoading] = useState(false);

  // Handle NGO Registration
  const handleNGORegistration = async () => {
    if (!ngoData.name || !ngoData.documentsHash) {
      toast.error('Please fill in all fields');
      return;
    }

    setNgoLoading(true);
    try {
      const result = await registerNGO(ngoData.name, ngoData.documentsHash);
      if (result.success) {
        setNgoData({ name: '', documentsHash: '' });
        toast.success('NGO registered successfully!', {
          description: `Transaction Hash: ${result.txHash?.slice(0, 10)}...`,
          action: result.txHash ? {
            label: 'View on Etherscan',
            onClick: () => window.open(`https://sepolia.etherscan.io/tx/${result.txHash}`, '_blank')
          } : undefined
        });
      }
    } catch (error) {
      console.error('NGO registration error:', error);
    } finally {
      setNgoLoading(false);
    }
  };

  // Handle Company Registration
  const handleCompanyRegistration = async () => {
    if (!companyData.name || !companyData.kycHash) {
      toast.error('Please fill in all fields');
      return;
    }

    setCompanyLoading(true);
    try {
      const result = await registerCompany(companyData.name, companyData.kycHash);
      if (result.success) {
        setCompanyData({ name: '', kycHash: '' });
        toast.success('Company registered successfully!', {
          description: `Transaction Hash: ${result.txHash?.slice(0, 10)}...`,
          action: result.txHash ? {
            label: 'View on Etherscan',
            onClick: () => window.open(`https://sepolia.etherscan.io/tx/${result.txHash}`, '_blank')
          } : undefined
        });
      }
    } catch (error) {
      console.error('Company registration error:', error);
    } finally {
      setCompanyLoading(false);
    }
  };

  // Handle NGO Verification
  const handleNGOVerification = async (approved: boolean) => {
    if (!verificationData.ngoId) {
      toast.error('Please enter NGO ID');
      return;
    }

    setVerificationLoading(true);
    try {
      const result = await verifyNGO(
        verificationData.ngoId, 
        approved, 
        verificationData.creditsToAllocate
      );
      if (result.success) {
        setVerificationData({ ngoId: '', creditsToAllocate: '' });
        toast.success(`NGO ${approved ? 'verified' : 'rejected'} successfully!`, {
          description: `Transaction Hash: ${result.txHash?.slice(0, 10)}...`,
          action: result.txHash ? {
            label: 'View on Etherscan',
            onClick: () => window.open(`https://sepolia.etherscan.io/tx/${result.txHash}`, '_blank')
          } : undefined
        });
      }
    } catch (error) {
      console.error('NGO verification error:', error);
    } finally {
      setVerificationLoading(false);
    }
  };

  // Handle Trade Execution
  const handleTradeExecution = async () => {
    if (!tradeData.sellerAddress || !tradeData.amount || !tradeData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setTradeLoading(true);
    try {
      const result = await executeTrade(
        tradeData.sellerAddress,
        tradeData.amount,
        tradeData.price,
        tradeData.pdfHash
      );
      if (result.success) {
        setTradeData({ sellerAddress: '', amount: '', price: '', pdfHash: '' });
        toast.success('Trade executed successfully!', {
          description: `Transaction Hash: ${result.txHash?.slice(0, 10)}...`,
          action: result.txHash ? {
            label: 'View on Etherscan',
            onClick: () => window.open(`https://sepolia.etherscan.io/tx/${result.txHash}`, '_blank')
          } : undefined
        });
      }
    } catch (error) {
      console.error('Trade execution error:', error);
    } finally {
      setTradeLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Wallet Not Connected</h3>
          <p className="text-gray-600">Please connect your wallet to perform blockchain transactions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="w-5 h-5" />
            <span>Blockchain Operations</span>
          </CardTitle>
          <CardDescription>
            Interact with smart contracts on the Sepolia testnet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="verify" disabled={userRole !== 'ADMIN'}>
                Verify
              </TabsTrigger>
              <TabsTrigger value="trade">Trade</TabsTrigger>
              <TabsTrigger value="query">Query</TabsTrigger>
            </TabsList>

            {/* Registration Tab */}
            <TabsContent value="register" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* NGO Registration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Register NGO</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="ngo-name">NGO Name</Label>
                      <Input
                        id="ngo-name"
                        value={ngoData.name}
                        onChange={(e) => setNgoData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter NGO name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ngo-docs">Documents Hash (IPFS)</Label>
                      <Input
                        id="ngo-docs"
                        value={ngoData.documentsHash}
                        onChange={(e) => setNgoData(prev => ({ ...prev, documentsHash: e.target.value }))}
                        placeholder="QmXXXXXXXXXXXXXXXXXXXX"
                      />
                    </div>
                    <Button 
                      onClick={handleNGORegistration}
                      disabled={ngoLoading}
                      className="w-full"
                    >
                      {ngoLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        'Register NGO'
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Company Registration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4" />
                      <span>Register Company</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        value={companyData.name}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company-kyc">KYC Hash (IPFS)</Label>
                      <Input
                        id="company-kyc"
                        value={companyData.kycHash}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, kycHash: e.target.value }))}
                        placeholder="QmXXXXXXXXXXXXXXXXXXXX"
                      />
                    </div>
                    <Button 
                      onClick={handleCompanyRegistration}
                      disabled={companyLoading}
                      className="w-full"
                    >
                      {companyLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        'Register Company'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Verification Tab (Admin Only) */}
            <TabsContent value="verify" className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Only administrators can verify NGOs and allocate carbon credits.
                </AlertDescription>
              </Alert>
              
              <Card>
                <CardHeader>
                  <CardTitle>NGO Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="ngo-id">NGO ID</Label>
                    <Input
                      id="ngo-id"
                      value={verificationData.ngoId}
                      onChange={(e) => setVerificationData(prev => ({ ...prev, ngoId: e.target.value }))}
                      placeholder="Enter NGO ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="credits-allocate">Credits to Allocate</Label>
                    <Input
                      id="credits-allocate"
                      type="number"
                      value={verificationData.creditsToAllocate}
                      onChange={(e) => setVerificationData(prev => ({ ...prev, creditsToAllocate: e.target.value }))}
                      placeholder="1000"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <Button 
                      onClick={() => handleNGOVerification(true)}
                      disabled={verificationLoading}
                      className="flex-1"
                    >
                      {verificationLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleNGOVerification(false)}
                      disabled={verificationLoading}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trade Tab */}
            <TabsContent value="trade" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="w-4 h-4" />
                    <span>Execute Trade</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="seller-address">Seller Address</Label>
                    <Input
                      id="seller-address"
                      value={tradeData.sellerAddress}
                      onChange={(e) => setTradeData(prev => ({ ...prev, sellerAddress: e.target.value }))}
                      placeholder="0x..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="trade-amount">Credits Amount</Label>
                      <Input
                        id="trade-amount"
                        type="number"
                        value={tradeData.amount}
                        onChange={(e) => setTradeData(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="trade-price">Price (ETH)</Label>
                      <Input
                        id="trade-price"
                        type="number"
                        step="0.001"
                        value={tradeData.price}
                        onChange={(e) => setTradeData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pdf-hash">Contract PDF Hash (Optional)</Label>
                    <Input
                      id="pdf-hash"
                      value={tradeData.pdfHash}
                      onChange={(e) => setTradeData(prev => ({ ...prev, pdfHash: e.target.value }))}
                      placeholder="QmXXXXXXXXXXXXXXXXXXXX"
                    />
                  </div>
                  <Button 
                    onClick={handleTradeExecution}
                    disabled={tradeLoading}
                    className="w-full"
                  >
                    {tradeLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Executing Trade...
                      </>
                    ) : (
                      'Execute Trade'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Query Tab */}
            <TabsContent value="query">
              <Card>
                <CardHeader>
                  <CardTitle>Query Blockchain Data</CardTitle>
                  <CardDescription>
                    View contract information and transaction history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Query functionality coming soon...</p>
                    <p className="text-sm text-gray-500 mt-2">
                      This will show NGO registration status, trade history, and more.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};