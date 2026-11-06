import React, { useState, useEffect, useCallback } from 'react';
import { useRoleAuth } from '../contexts/RoleAuthContext';
import { useBlockchain } from '../contexts/BlockchainContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PlusCircle, FileText, Coins, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { tokenTransferService } from '../utils/TokenTransferService';
import { getTxUrl } from '../blockchain-integration/config';
import { api, type AiReview, type Ecosystem, type Listing, type Project } from '@/lib/api';
import { errorMessage } from '@/lib/errors';

const ECOSYSTEMS: { value: Ecosystem; label: string }[] = [
  { value: 'MANGROVE', label: 'Mangrove' },
  { value: 'SEAGRASS', label: 'Seagrass' },
  { value: 'SALT_MARSH', label: 'Salt marsh' },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  location: '',
  ecosystem: 'MANGROVE' as Ecosystem,
  latitude: '',
  longitude: '',
  area: '',
  expectedCredits: '',
};

export default function NGODashboard() {
  const { authState, logout } = useRoleAuth();
  const { registerNGO, isConnected, connectWallet, walletAddress, ethBalance, tokenBalance } = useBlockchain();
  const ngoAddress = authState.user?.address ?? '';

  const [projects, setProjects] = useState<Project[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [bccBalance, setBccBalance] = useState('0');
  const [loadError, setLoadError] = useState<string | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [lastReview, setLastReview] = useState<AiReview | null>(null);

  // per-project "list for sale" inputs
  const [saleInputs, setSaleInputs] = useState<Record<string, { credits: string; price: string }>>({});
  const [approveAmount, setApproveAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const walletMismatch = isConnected && walletAddress && walletAddress.toLowerCase() !== ngoAddress.toLowerCase();

  const loadData = useCallback(async () => {
    if (!ngoAddress) return;
    try {
      const [mine, listings, balance] = await Promise.all([
        api.listProjects('NGO', ngoAddress),
        api.listListings(),
        tokenTransferService.getTokenBalance(ngoAddress),
      ]);
      setProjects(mine);
      setMyListings(listings.filter(l => l.ngoAddress.toLowerCase() === ngoAddress.toLowerCase()));
      setBccBalance(balance);
      setLoadError(null);
    } catch (error) {
      setLoadError(errorMessage(error));
    }
  }, [ngoAddress]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const verified = projects.filter(p => p.status === 'VERIFIED');
  const creditsForSale = myListings.reduce((sum, l) => sum + l.credits, 0);
  const totalAllocated = verified.reduce((sum, p) => sum + (p.allocatedCredits ?? 0), 0);

  const submitProject = async () => {
    const credits = parseInt(form.expectedCredits, 10);
    if (!form.title || !form.description || !form.location || !form.latitude || !form.longitude) {
      alert('Please fill in the title, description, location and coordinates');
      return;
    }
    if (isNaN(credits) || credits <= 0) {
      alert('Please enter a valid number of expected credits');
      return;
    }
    if (photos.length === 0) {
      alert('Please attach at least one geo-tagged field photo (JPEG or PNG)');
      return;
    }

    const body = new FormData();
    body.append('title', form.title);
    body.append('description', form.description);
    body.append('location', form.location);
    body.append('ecosystem', form.ecosystem);
    body.append('latitude', form.latitude);
    body.append('longitude', form.longitude);
    body.append('area', form.area || '0');
    body.append('carbonCreditsEstimated', String(credits));
    body.append('submitterAddress', ngoAddress);
    body.append('submitterName', authState.user?.name ?? 'NGO');
    photos.forEach(file => body.append('files', file));

    setSubmitting(true);
    try {
      const result = await api.submitProject(body);
      setLastReview(result.aiReview);
      setForm(EMPTY_FORM);
      setPhotos([]);
      await loadData();
      alert(`✅ "${result.project.title}" submitted for auditor review.\n\nAutomated evidence screening: ${result.aiReview.status}`);
    } catch (error) {
      alert(`❌ Submission failed: ${errorMessage(error)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const listCredits = async (project: Project) => {
    const input = saleInputs[project.id] ?? { credits: '', price: '' };
    const credits = parseInt(input.credits, 10);
    const price = parseFloat(input.price);
    if (!credits || credits <= 0 || !price || price <= 0) {
      alert('Enter the number of credits and a price in ETH per credit');
      return;
    }
    try {
      await api.upsertListing({ projectId: project.id, credits, pricePerCredit: price, ngoAddress });
      alert(`✅ ${credits} credits listed at ${price} ETH each. Companies can now see them on the marketplace.`);
      await loadData();
    } catch (error) {
      alert(`❌ Listing failed: ${errorMessage(error)}`);
    }
  };

  const handleBlockchainRegistration = async () => {
    const confirmed = window.confirm(
      `Register "${authState.user?.name}" on the blockchain?\n\nThis creates an NGO record on the Marketplace contract and uses ETH for gas.`
    );
    if (!confirmed) return;
    const result = await registerNGO(authState.user?.name || 'NGO', `documents-hash-${Date.now()}`);
    if (result.success) {
      alert(`✅ NGO registered on-chain.\n\n🔗 ${result.txHash ? getTxUrl(result.txHash) || result.txHash : ''}`);
    } else {
      alert(`❌ Registration failed: ${result.error}`);
    }
  };

  // Let the Marketplace contract sell this NGO's BCC to companies (ERC-20 approve)
  const approveForMarketplace = async () => {
    if (!isConnected || walletMismatch) {
      alert(`Connect the NGO wallet in MetaMask first:\n${ngoAddress}`);
      return;
    }
    const amount = parseFloat(approveAmount);
    if (!amount || amount <= 0) {
      alert('Enter how many BCC credits the marketplace may sell');
      return;
    }
    setIsApproving(true);
    const result = await tokenTransferService.approveMarketplace(amount);
    setIsApproving(false);
    if (result.success) {
      alert(`✅ Marketplace approved to sell ${amount} BCC.\n\n🔗 ${getTxUrl(result.txHash!) || result.txHash}`);
      setApproveAmount('');
    } else {
      alert(`❌ Approval failed: ${result.error}`);
    }
  };

  const statusIcon = (status: Project['status']) => {
    if (status === 'VERIFIED') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'REJECTED') return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const statusColor = (status: Project['status']) => {
    if (status === 'VERIFIED') return 'bg-green-100 text-green-800';
    if (status === 'REJECTED') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (!authState.isAuthenticated || authState.role !== 'NGO') {
    return <div>Access denied. NGO role required.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NGO Dashboard</h1>
            <p className="text-gray-600">Welcome, {authState.user?.name}</p>
            <p className="text-xs font-mono text-gray-500">Wallet to use in MetaMask: {ngoAddress}</p>
          </div>
          <Button onClick={logout} variant="outline">Logout</Button>
        </div>

        {loadError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 text-sm text-red-700">⚠️ {loadError}</CardContent>
          </Card>
        )}

        {!isConnected && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">Connect your wallet</h3>
                  <p className="text-sm text-blue-600">Connect MetaMask to register on-chain and approve credits for sale</p>
                </div>
                <Button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700">Connect Wallet</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isConnected && (
          <Card className={`mb-6 ${walletMismatch ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  {walletMismatch ? (
                    <>
                      <h3 className="text-lg font-semibold text-red-800">Wrong wallet connected</h3>
                      <p className="text-sm text-red-600">Connected: {walletAddress}. Switch MetaMask to {ngoAddress}.</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-green-800">🔗 Wallet connected</h3>
                      <p className="text-sm text-green-600">ETH: {ethBalance} | BCC: {tokenBalance}</p>
                      <Button onClick={handleBlockchainRegistration} className="mt-2 bg-green-600 hover:bg-green-700 text-sm" size="sm">
                        Register NGO on Blockchain
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card><CardContent className="p-6 flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p></div>
            <FileText className="w-8 h-8 text-blue-500" />
          </CardContent></Card>
          <Card><CardContent className="p-6 flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Verified Projects</p>
              <p className="text-2xl font-bold text-green-600">{verified.length}</p></div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </CardContent></Card>
          <Card><CardContent className="p-6 flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">BCC Balance (on-chain)</p>
              <p className="text-2xl font-bold text-blue-600">{bccBalance}</p></div>
            <Coins className="w-8 h-8 text-blue-500" />
          </CardContent></Card>
          <Card><CardContent className="p-6 flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Listed for Sale</p>
              <p className="text-2xl font-bold text-purple-600">{creditsForSale}</p></div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </CardContent></Card>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="submit">Submit New Project</TabsTrigger>
            <TabsTrigger value="marketplace">Manage Credits</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Portfolio</CardTitle>
                <CardDescription>Track the status of your submitted blue carbon projects</CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No projects submitted yet. Submit your first project to get started!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map(project => (
                      <div key={project.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">{project.title}</h3>
                          <div className="flex items-center gap-2">
                            {statusIcon(project.status)}
                            <Badge className={statusColor(project.status)}>{project.status}</Badge>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{project.description}</p>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div><span className="font-medium">Location:</span> {project.location}</div>
                          <div><span className="font-medium">Expected Credits:</span> {project.carbonCreditsEstimated}</div>
                          <div><span className="font-medium">Submitted:</span> {new Date(project.submissionDate).toLocaleDateString()}</div>
                        </div>
                        {project.aiReview && (
                          <p className="mt-2 text-sm text-gray-600">
                            Evidence screening: <strong>{project.aiReview.status}</strong> ({project.evidenceFiles.length} photo
                            {project.evidenceFiles.length === 1 ? '' : 's'})
                          </p>
                        )}
                        {project.status === 'VERIFIED' && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-green-800 text-sm">
                            ✅ {project.allocatedCredits} BCC issued to your wallet
                            {project.mintTxHash && (
                              <> — <a className="underline" href={getTxUrl(project.mintTxHash) || undefined} target="_blank" rel="noreferrer">view transaction</a></>
                            )}
                          </div>
                        )}
                        {project.status === 'REJECTED' && project.verificationNotes && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-red-800 text-sm">Auditor notes: {project.verificationNotes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5" />
                  Submit New Blue Carbon Project
                </CardTitle>
                <CardDescription>
                  Photos are screened automatically (resolution, EXIF GPS distance from the project location, vegetation colour) before an auditor reviews them
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Title</label>
                  <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Mangrove Restoration in Goa" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Project Description</label>
                  <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your project, methods and expected impact" rows={4} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g., Goa, India" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ecosystem</label>
                    <select
                      aria-label="Ecosystem"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.ecosystem}
                      onChange={e => setForm({ ...form, ecosystem: e.target.value as Ecosystem })}
                    >
                      {ECOSYSTEMS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Latitude</label>
                    <Input type="number" step="any" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} placeholder="15.3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Longitude</label>
                    <Input type="number" step="any" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} placeholder="73.9" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Area (hectares)</label>
                    <Input type="number" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} placeholder="10" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Expected Carbon Credits</label>
                  <Input type="number" value={form.expectedCredits} onChange={e => setForm({ ...form, expectedCredits: e.target.value })} placeholder="Estimated number of carbon credits" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Field photos (JPEG or PNG, up to 10)</label>
                  <input
                    type="file"
                    aria-label="Field photos"
                    multiple
                    accept="image/jpeg,image/png"
                    onChange={e => setPhotos(Array.from(e.target.files ?? []).slice(0, 10))}
                    className="block w-full text-sm"
                  />
                  {photos.length > 0 && <p className="text-xs text-gray-500 mt-1">{photos.length} photo(s) selected</p>}
                </div>

                <Button onClick={submitProject} disabled={submitting} className="w-full">
                  {submitting ? 'Uploading and screening…' : 'Submit Project for Review'}
                </Button>

                {lastReview && (
                  <div className="border rounded-lg p-4 bg-gray-50 text-sm space-y-2">
                    <p className="font-semibold">Automated evidence screening: {lastReview.status}</p>
                    {lastReview.results.map(r => (
                      <div key={r.file}>
                        <span className="font-medium">{r.file}</span>: {r.ok ? 'passed basic checks' : r.issues.join('; ')}
                        {r.signals.greenDominance && ' · vegetation colour detected'}
                      </div>
                    ))}
                    <p className="text-xs text-gray-500">This is a rule-based pre-check. An auditor still makes the final decision.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Credit Management</CardTitle>
                <CardDescription>Credits issued to your wallet by auditors, and how you sell them</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">BCC in your wallet: {bccBalance}</h3>
                  <p className="text-blue-700 text-sm">Issued so far through verified projects: {totalAllocated}</p>
                </div>

                {verified.map(project => {
                  const listing = myListings.find(l => l.projectId === project.id);
                  const input = saleInputs[project.id] ?? { credits: '', price: '' };
                  return (
                    <div key={project.id} className="border rounded-lg p-4">
                      <h4 className="font-semibold">{project.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {project.allocatedCredits} BCC issued
                        {listing ? ` · listed: ${listing.credits} at ${listing.pricePerCredit} ETH each` : ' · not listed'}
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Credits to Sell</label>
                          <Input
                            type="number"
                            max={project.allocatedCredits}
                            value={input.credits}
                            onChange={e => setSaleInputs({ ...saleInputs, [project.id]: { ...input, credits: e.target.value } })}
                            placeholder="Number of credits"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Price per Credit (ETH)</label>
                          <Input
                            type="number"
                            step="any"
                            value={input.price}
                            onChange={e => setSaleInputs({ ...saleInputs, [project.id]: { ...input, price: e.target.value } })}
                            placeholder="0.001"
                          />
                        </div>
                      </div>
                      <Button onClick={() => listCredits(project)} className="mt-4">List Credits for Sale</Button>
                    </div>
                  );
                })}

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-1">Approve Credits for On-Chain Sale</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Lets the Marketplace contract transfer your BCC tokens to a buyer when they pay. Required before companies can purchase. MetaMask will ask you to confirm an <code>approve</code> transaction.
                  </p>
                  <div className="flex gap-2">
                    <Input type="number" min="0" value={approveAmount} onChange={e => setApproveAmount(e.target.value)} placeholder="BCC amount to approve" />
                    <Button onClick={approveForMarketplace} disabled={isApproving}>
                      {isApproving ? 'Approving…' : 'Approve'}
                    </Button>
                  </div>
                </div>

                {verified.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No credits issued yet. Submit a project and wait for auditor approval.
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
