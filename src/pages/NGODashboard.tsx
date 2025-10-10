import React, { useState, useEffect } from 'react';
import { useRoleAuth } from '../contexts/RoleAuthContext';
import { useBlockchain } from '../contexts/BlockchainContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PlusCircle, FileText, Coins, TrendingUp, Clock, CheckCircle, XCircle, IndianRupee } from 'lucide-react';
import { DemoBlockchainService } from '../utils/DemoBlockchainService.js';
import DemoModeBanner from '../components/DemoModeBanner';

interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  expectedCredits: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  allocatedCredits?: number;
}

export default function NGODashboard() {
  const { authState, logout } = useRoleAuth();
  const { registerNGO, isConnected, connectWallet, ethBalance, tokenBalance } = useBlockchain();

  // Utility function to format Indian Rupees
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };
  const [projects, setProjects] = useState<Project[]>([]);
  const [allocatedCredits, setAllocatedCredits] = useState(0);
  const [creditsForSale, setCreditsForSale] = useState(0);
  const [salePrice, setSalePrice] = useState('');
  
  // New project form
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    location: '',
    expectedCredits: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadNGOData();
  }, []);

  const loadNGOData = () => {
    // Load projects from localStorage (simulating backend)
    const savedProjects = localStorage.getItem(`ngo_projects_${authState.user?.address}`);
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }

    // Load allocated credits
    const savedCredits = localStorage.getItem(`ngo_credits_${authState.user?.address}`);
    if (savedCredits) {
      setAllocatedCredits(parseInt(savedCredits));
    }

    // Load credits for sale
    const savedForSale = localStorage.getItem(`ngo_for_sale_${authState.user?.address}`);
    if (savedForSale) {
      setCreditsForSale(parseInt(savedForSale));
    }
  };

  const submitProject = () => {
    if (!newProject.title || !newProject.description || !newProject.location || !newProject.expectedCredits) {
      alert('Please fill in all fields');
      return;
    }

    const expectedCreditsNum = parseInt(newProject.expectedCredits);
    if (isNaN(expectedCreditsNum) || expectedCreditsNum <= 0) {
      alert('Please enter a valid number of expected credits');
      return;
    }

    const project: Project = {
      id: Date.now().toString(),
      title: newProject.title,
      description: newProject.description,
      location: newProject.location,
      expectedCredits: expectedCreditsNum,
      status: 'pending',
      submittedDate: new Date().toLocaleDateString()
    };

    const updatedProjects = [...projects, project];
    setProjects(updatedProjects);
    
    // Save to localStorage
    localStorage.setItem(`ngo_projects_${authState.user?.address}`, JSON.stringify(updatedProjects));
    
    // Reset form
    setNewProject({
      title: '',
      description: '',
      location: '',
      expectedCredits: ''
    });

    // Show success message with better UX
    const successMessage = `✅ Project "${project.title}" submitted successfully! It will now appear in the Auditor's pending review queue.`;
    alert(successMessage);
    
    console.log('Project submitted:', project);
  };

  const putCreditsForSale = () => {
    if (!salePrice || parseInt(salePrice) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    if (creditsForSale <= 0 || creditsForSale > allocatedCredits) {
      alert('Please enter a valid number of credits to sell');
      return;
    }

    // Save the sale offer to marketplace (localStorage)
    const saleOffer = {
      ngoAddress: authState.user?.address,
      ngoName: authState.user?.name,
      credits: creditsForSale,
      pricePerCredit: parseFloat(salePrice),
      totalPrice: creditsForSale * parseFloat(salePrice),
      timestamp: new Date().toISOString()
    };

    const existingOffers = JSON.parse(localStorage.getItem('marketplace_offers') || '[]');
    const updatedOffers = [...existingOffers, saleOffer];
    localStorage.setItem('marketplace_offers', JSON.stringify(updatedOffers));

    alert(`Successfully listed ${creditsForSale} credits for sale at ${formatINR(parseFloat(salePrice))} each!`);
    setCreditsForSale(0);
    setSalePrice('');
  };

  const handleBlockchainRegistration = async () => {
    if (!isConnected && !DemoBlockchainService.DEMO_MODE) {
      await connectWallet();
      return;
    }

    const confirmRegistration = window.confirm(
      DemoBlockchainService.DEMO_MODE
        ? `🎭 Demo Mode: Register "${authState.user?.name}" on simulated blockchain?\n\nThis will simulate NGO registration for demonstration purposes.`
        : `Register "${authState.user?.name}" on the blockchain?\n\nThis will create an official NGO record on the Sepolia testnet and use ETH for gas fees.`
    );

    if (!confirmRegistration) return;

    try {
      let result;
      
      if (DemoBlockchainService.DEMO_MODE) {
        result = await DemoBlockchainService.simulateNGORegistration(
          authState.user?.name || 'NGO',
          `documents-hash-${Date.now()}`
        );
      } else {
        result = await registerNGO(
          authState.user?.name || 'NGO',
          `documents-hash-${Date.now()}` // In production, this would be an IPFS hash
        );
      }

      if (result.success) {
        const successMessage = DemoBlockchainService.DEMO_MODE
          ? `✅ DEMO SUCCESS! NGO "${authState.user?.name}" simulated registration!\n\n🎭 Mock Transaction Hash: ${result.txHash}\n🔗 Demo mode is active - switch to real blockchain once contracts are fixed!`
          : `✅ BLOCKCHAIN SUCCESS! NGO "${authState.user?.name}" registered on blockchain!\n\n🔗 Transaction Hash: ${result.txHash}\n\nYou can now receive carbon credits directly to your wallet.`;
          
        alert(successMessage);
      } else {
        alert(`❌ Registration failed: ${result.error}`);
      }
    } catch (error: any) {
      alert(`❌ Registration failed: ${error.message}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!authState.isAuthenticated || authState.role !== 'NGO') {
    return <div>Access denied. NGO role required.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NGO Dashboard</h1>
            <p className="text-gray-600">Welcome, {authState.user?.name}</p>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        {/* Demo Mode Banner */}
        <DemoModeBanner />

        {/* Blockchain Status Card */}
        {!isConnected && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">Register on Blockchain</h3>
                  <p className="text-sm text-blue-600">Connect your wallet to register as an NGO on the blockchain and manage your carbon credits</p>
                </div>
                <Button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700">
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isConnected && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800">🔗 Blockchain Connected!</h3>
                  <p className="text-sm text-green-600">ETH Balance: {ethBalance} | Carbon Credits: {tokenBalance}</p>
                  <Button 
                    onClick={() => handleBlockchainRegistration()} 
                    className="mt-2 bg-green-600 hover:bg-green-700 text-sm"
                    size="sm"
                  >
                    Register NGO on Blockchain
                  </Button>
                </div>
                <div className="text-green-600 font-mono text-sm">
                  Sepolia Testnet ✅
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Projects</p>
                  <p className="text-2xl font-bold text-green-600">
                    {projects.filter(p => p.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Allocated Credits</p>
                  <p className="text-2xl font-bold text-blue-600">{allocatedCredits}</p>
                </div>
                <Coins className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available to Sell</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {allocatedCredits - creditsForSale}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="submit">Submit New Project</TabsTrigger>
            <TabsTrigger value="marketplace">Manage Credits</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Portfolio</CardTitle>
                <CardDescription>
                  Track the status of your submitted blue carbon projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No projects submitted yet. Submit your first project to get started!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">{project.title}</h3>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(project.status)}
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{project.description}</p>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Location:</span> {project.location}
                          </div>
                          <div>
                            <span className="font-medium">Expected Credits:</span> {project.expectedCredits}
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span> {project.submittedDate}
                          </div>
                        </div>
                        {project.allocatedCredits && (
                          <div className="mt-2 p-2 bg-green-50 rounded">
                            <span className="text-green-800">
                              ✅ Allocated Credits: {project.allocatedCredits}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submit Tab */}
          <TabsContent value="submit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5" />
                  Submit New Blue Carbon Project
                </CardTitle>
                <CardDescription>
                  Provide details about your blue carbon conservation project for auditor review
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Title</label>
                  <Input
                    value={newProject.title}
                    onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                    placeholder="e.g., Mangrove Restoration in Florida Bay"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Project Description</label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Describe your blue carbon project, conservation methods, expected impact..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    value={newProject.location}
                    onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                    placeholder="e.g., Florida Bay, United States"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Expected Carbon Credits</label>
                  <Input
                    type="number"
                    value={newProject.expectedCredits}
                    onChange={(e) => setNewProject({...newProject, expectedCredits: e.target.value})}
                    placeholder="Estimated number of carbon credits"
                  />
                </div>

                <Button onClick={submitProject} className="w-full">
                  Submit Project for Review
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Credit Management</CardTitle>
                <CardDescription>
                  Manage your allocated credits and list them for sale
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Available Credits: {allocatedCredits}</h3>
                  <p className="text-blue-700 text-sm">
                    These credits have been allocated to you by auditors for approved projects.
                  </p>
                </div>

                {allocatedCredits > 0 && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-4">List Credits for Sale</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Credits to Sell</label>
                        <Input
                          type="number"
                          max={allocatedCredits}
                          value={creditsForSale}
                          onChange={(e) => setCreditsForSale(parseInt(e.target.value) || 0)}
                          placeholder="Number of credits"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Price per Credit (₹)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                          placeholder="Price per credit"
                        />
                      </div>
                    </div>
                    <Button onClick={putCreditsForSale} className="mt-4">
                      List Credits for Sale
                    </Button>
                  </div>
                )}

                {allocatedCredits === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No credits allocated yet. Submit projects and wait for auditor approval.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}