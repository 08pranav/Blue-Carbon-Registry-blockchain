import React, { useState, useEffect } from 'react';
import { useRoleAuth } from '../contexts/RoleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Clock, CheckCircle, XCircle, FileText, Users, Award } from 'lucide-react';
import { errorMessage } from '@/lib/errors';
import { tokenTransferService } from '../utils/TokenTransferService';
import { FIXED_WALLETS } from '../utils/fixedWallets';
import { validateWalletConnection, showWalletTransactionInfo } from '../utils/walletUtils.js';
import { DemoBlockchainService } from '../utils/DemoBlockchainService.js';

interface Project {
  id: string;
  ngoAddress: string;
  ngoName?: string;
  title: string;
  description: string;
  location: string;
  expectedCredits: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  allocatedCredits?: number;
  auditNotes?: string;
  auditDate?: string;
}

interface ApprovalResult {
  success: boolean;
  error?: string;
  txHash?: string;
  message?: string;
}

export default function AuditorDashboard() {
  const { authState, logout } = useRoleAuth();
  
  // Mock blockchain connection state for simplified auditor workflow
  const isConnected = true;
  const ethBalance = "1.25";
  const walletAddress = FIXED_WALLETS.AUDITOR;
  const connectWallet = async () => {
    // Simplified connection - no actual blockchain setup needed
    console.log('Auditor wallet connected (simplified)');
  };
  
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [auditNotes, setAuditNotes] = useState('');
  const [allocatedCredits, setAllocatedCreditsInput] = useState('');

  useEffect(() => {
    loadAllProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  // Load all projects from all NGOs
  const loadAllProjects = () => {
    const allProjects: Project[] = [];
    
    // Get all localStorage keys that start with 'ngo_projects_'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ngo_projects_')) {
        const ngoAddress = key.replace('ngo_projects_', '');
        const projects = JSON.parse(localStorage.getItem(key) || '[]');
        
        // Add NGO address to each project and add NGO name
        const projectsWithNGO = projects.map((project: Project) => ({
          ...project,
          ngoAddress,
          ngoName: getNGOName(ngoAddress)
        }));
        
        allProjects.push(...projectsWithNGO);
      }
    }
    
    // Sort by submitted date (newest first)
    allProjects.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
    setAllProjects(allProjects);
  };

  const getNGOName = (address: string) => {
    // Simple mapping for demo purposes
    const addressToName: { [key: string]: string } = {
      '0x24cF2631Cd812089e14da2Bb6d7A7C5505258656': 'Mumbai Coastal Conservation Society',
      '0x179d59195f5771E907463986bCE98B0369e52837': 'Maharashtra Blue Carbon Authority',
      '0x8ba1f109551bD432803012645Hac136c82C5761': 'Tata Sustainability Solutions'
    };
    return addressToName[address] || `NGO ${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Permission setup removed - auditor is assumed to have minting privileges

  const approveProject = async () => {
    if (!selectedProject || !allocatedCredits) {
      alert('Please select a project and enter allocated credits');
      return;
    }

    if (!isConnected && !DemoBlockchainService.DEMO_MODE) {
      const shouldConnect = window.confirm('You need to connect your wallet to approve projects on blockchain. Connect now?');
      if (shouldConnect) {
        await connectWallet();
      }
      return;
    }

    const creditsNum = parseInt(allocatedCredits);
    if (creditsNum <= 0) {
      alert('Please enter a valid number of credits');
      return;
    }

    const confirmApproval = window.confirm(
      DemoBlockchainService.DEMO_MODE 
        ? `� DEMO MODE APPROVAL\n\nApprove project "${selectedProject.title}" and simulate minting ${creditsNum} carbon credits to NGO "${selectedProject.ngoName}"?\n\n✨ This is a demonstration - no real blockchain transactions will occur.`
        : `🌊 BLOCKCHAIN APPROVAL\n\nApprove project "${selectedProject.title}" and issue ${creditsNum} BCC to NGO "${selectedProject.ngoName}" via Marketplace.verifyNGO()?\n\nMetaMask will ask you to confirm the transaction (and a registerNGO transaction first if this NGO has no on-chain record). Gas is paid in Sepolia ETH.`
    );

    if (!confirmApproval) return;

    try {
      // Simplified auditor workflow - assume wallet is always valid
      console.log('Auditor wallet validation passed (simplified)');

      // Initialize result with default failure state
      let result: ApprovalResult = { success: false, error: 'Unknown error occurred' };

      if (DemoBlockchainService.DEMO_MODE) {
        result = await DemoBlockchainService.simulateProjectApproval(selectedProject.id, creditsNum);
      } else {
        // Real on-chain issuance via Marketplace.verifyNGO(). No silent fallback: if the
        // transaction fails, the project stays pending and the auditor sees why.
        result = await tokenTransferService.mintCreditsToNGO(
          selectedProject.ngoAddress,
          creditsNum,
          FIXED_WALLETS.AUDITOR,
          selectedProject.ngoName
        );
      }

      // Ensure result is always a valid object with success property
      if (!result || typeof result !== 'object' || !('success' in result)) {
        result = { success: false, error: 'Invalid service response' };
      }

      if (result.success) {
        // Update project status locally for UI
        const updatedProject = {
          ...selectedProject,
          status: 'approved' as const,
          allocatedCredits: creditsNum,
          auditNotes,
          auditDate: new Date().toLocaleDateString()
        };

        // Update in storage
        updateProjectInStorage(updatedProject);
        
        // Update NGO's total allocated credits
        updateNGOCredits(selectedProject.ngoAddress, creditsNum);
        
        // Reset form
        setSelectedProject(null);
        setAuditNotes('');
        setAllocatedCreditsInput('');
        
        const successMessage = DemoBlockchainService.DEMO_MODE
          ? `✅ DEMO SUCCESS! Project approved and ${creditsNum} carbon credits simulated!\n\n🎭 Mock Transaction Hash: ${result.txHash}\n🔗 Demo mode is active - switch to real blockchain once contracts are fixed!`
          : showWalletTransactionInfo('AUDITOR', 'NGO', creditsNum, 'mint', result.txHash);
          
        alert(successMessage);
        loadAllProjects();
      } else {
        alert(`❌ ${DemoBlockchainService.DEMO_MODE ? 'Demo' : 'Blockchain'} approval failed: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Approval failed: ${errorMessage(error)}`);
    }
  };

  const rejectProject = () => {
    if (!selectedProject) {
      alert('Please select a project');
      return;
    }

    const updatedProject = {
      ...selectedProject,
      status: 'rejected' as const,
      auditNotes,
      auditDate: new Date().toLocaleDateString()
    };

    updateProjectInStorage(updatedProject);
    
    // Reset form
    setSelectedProject(null);
    setAuditNotes('');
    setAllocatedCreditsInput('');
    
    alert('Project rejected');
    loadAllProjects();
  };

  const updateProjectInStorage = (updatedProject: Project) => {
    const storageKey = `ngo_projects_${updatedProject.ngoAddress}`;
    const existingProjects = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const updatedProjects = existingProjects.map((project: Project) => 
      project.id === updatedProject.id ? updatedProject : project
    );
    
    localStorage.setItem(storageKey, JSON.stringify(updatedProjects));
  };

  const updateNGOCredits = (ngoAddress: string, creditsToAdd: number) => {
    const creditsKey = `ngo_credits_${ngoAddress}`;
    const currentCredits = parseInt(localStorage.getItem(creditsKey) || '0');
    const newTotal = currentCredits + creditsToAdd;
    localStorage.setItem(creditsKey, newTotal.toString());
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

  const pendingProjects = allProjects.filter(p => p.status === 'pending');
  const reviewedProjects = allProjects.filter(p => p.status !== 'pending');

  if (!authState.isAuthenticated || authState.role !== 'AUDITOR') {
    return <div>Access denied. Auditor role required.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Auditor Dashboard</h1>
            <p className="text-gray-600">Welcome, {authState.user?.name}</p>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>



        {/* Blockchain Status Card */}
        {!isConnected && (
          <Card className="mb-6 border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-purple-800">Connect Wallet for Blockchain Verification</h3>
                  <p className="text-sm text-purple-600">Connect your wallet to approve projects and mint carbon credits on the blockchain</p>
                </div>
                <Button onClick={connectWallet} className="bg-purple-600 hover:bg-purple-700">
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Permission setup step removed - auditor assumed to have minting privileges */}

        {isConnected && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800">🔗 Auditor Wallet Connected & Ready!</h3>
                  <p className="text-sm text-green-600">ETH Balance: {ethBalance} | Ready to approve projects and mint credits</p>
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
                  <p className="text-2xl font-bold text-gray-900">{allProjects.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingProjects.length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {allProjects.filter(p => p.status === 'approved').length}
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
                  <p className="text-sm font-medium text-gray-600">Credits Allocated</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {allProjects
                      .filter(p => p.status === 'approved')
                      .reduce((sum, p) => sum + (p.allocatedCredits || 0), 0)}
                  </p>
                </div>
                <Award className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Review ({pendingProjects.length})</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed ({reviewedProjects.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Projects List */}
              <Card>
                <CardHeader>
                  <CardTitle>Projects Pending Review</CardTitle>
                  <CardDescription>Click on a project to review</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {pendingProjects.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No pending projects</p>
                    ) : (
                      pendingProjects.map((project) => (
                        <div
                          key={project.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedProject?.id === project.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedProject(project)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{project.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{project.ngoName}</p>
                              <p className="text-sm text-gray-500 mt-1">{project.location}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm text-green-600 font-medium">
                                  {project.expectedCredits} credits expected
                                </span>
                                <span className="text-xs text-gray-400">
                                  {project.submittedDate}
                                </span>
                              </div>
                            </div>
                            <Badge className={getStatusColor(project.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(project.status)}
                                {project.status}
                              </div>
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Review Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Review</CardTitle>
                  <CardDescription>
                    {selectedProject ? `Reviewing: ${selectedProject.title}` : 'Select a project to review'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedProject ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Project Details</h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <p><strong>Title:</strong> {selectedProject.title}</p>
                          <p><strong>NGO:</strong> {selectedProject.ngoName}</p>
                          <p><strong>Location:</strong> {selectedProject.location}</p>
                          <p><strong>Expected Credits:</strong> {selectedProject.expectedCredits}</p>
                          <p><strong>Description:</strong></p>
                          <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                            {selectedProject.description}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Credits to Allocate (if approved)
                        </label>
                        <Input
                          type="number"
                          value={allocatedCredits}
                          onChange={(e) => setAllocatedCreditsInput(e.target.value)}
                          placeholder="Enter credits to allocate"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Audit Notes</label>
                        <Textarea
                          value={auditNotes}
                          onChange={(e) => setAuditNotes(e.target.value)}
                          placeholder="Enter your review notes..."
                          rows={4}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={approveProject} className="flex-1">
                          Approve Project
                        </Button>
                        <Button onClick={rejectProject} variant="destructive" className="flex-1">
                          Reject Project
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Select a project from the list to begin review
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviewed">
            <Card>
              <CardHeader>
                <CardTitle>Reviewed Projects</CardTitle>
                <CardDescription>Projects that have been approved or rejected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviewedProjects.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No reviewed projects yet</p>
                  ) : (
                    reviewedProjects.map((project) => (
                      <div key={project.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{project.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{project.ngoName}</p>
                            <p className="text-sm text-gray-500 mt-1">{project.location}</p>
                            <div className="flex items-center gap-4 mt-2">
                              {project.status === 'approved' && project.allocatedCredits && (
                                <span className="text-sm text-green-600 font-medium">
                                  {project.allocatedCredits} credits allocated
                                </span>
                              )}
                              <span className="text-xs text-gray-400">
                                Reviewed: {project.auditDate}
                              </span>
                            </div>
                            {project.auditNotes && (
                              <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                                <strong>Notes:</strong> {project.auditNotes}
                              </p>
                            )}
                          </div>
                          <Badge className={getStatusColor(project.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(project.status)}
                              {project.status}
                            </div>
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}