import React, { useState, useEffect, useCallback } from 'react';
import { useRoleAuth } from '../contexts/RoleAuthContext';
import { useBlockchain } from '../contexts/BlockchainContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Clock, CheckCircle, XCircle, FileText, Award } from 'lucide-react';
import { tokenTransferService } from '../utils/TokenTransferService';
import { FIXED_WALLETS } from '../utils/fixedWallets';
import { getTxUrl } from '../blockchain-integration/config';
import { api, type Project } from '@/lib/api';
import { errorMessage } from '@/lib/errors';

interface UnrecordedApproval {
  projectId: string;
  txHash: string;
  credits: number;
  notes: string;
}

const reviewColor = (status: string) =>
  status === 'APPROVE' ? 'bg-green-100 text-green-800' : status === 'REJECT' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';

export default function AuditorDashboard() {
  const { authState, logout } = useRoleAuth();
  const { isConnected, connectWallet, walletAddress, ethBalance } = useBlockchain();
  const auditorAddress = FIXED_WALLETS.AUDITOR;

  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [auditNotes, setAuditNotes] = useState('');
  const [credits, setCredits] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  // On-chain issuance succeeded but telling the backend failed: never mint twice, only retry recording
  const [unrecorded, setUnrecorded] = useState<UnrecordedApproval | null>(null);

  const walletMismatch = isConnected && walletAddress && walletAddress.toLowerCase() !== auditorAddress.toLowerCase();

  const loadProjects = useCallback(async () => {
    try {
      const all = await api.listProjects('AUDITOR');
      setProjects([...all].sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()));
      setLoadError(null);
    } catch (error) {
      setLoadError(errorMessage(error));
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const pending = projects.filter(p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW');
  const reviewed = projects.filter(p => p.status === 'VERIFIED' || p.status === 'REJECTED');

  const select = (project: Project) => {
    setSelected(project);
    setAuditNotes('');
    setCredits(String(project.carbonCreditsEstimated));
  };

  const recordApproval = async (approval: UnrecordedApproval) => {
    await api.setProjectStatus(approval.projectId, {
      status: 'VERIFIED',
      notes: approval.notes,
      allocatedCredits: approval.credits,
      mintTxHash: approval.txHash,
    });
    setUnrecorded(null);
    setSelected(null);
    setCredits('');
    setAuditNotes('');
    await loadProjects();
  };

  const approveProject = async () => {
    if (!selected) return;
    const creditsNum = parseInt(credits, 10);
    if (!creditsNum || creditsNum <= 0) {
      alert('Please enter a valid number of credits');
      return;
    }
    const confirmed = window.confirm(
      `Approve "${selected.title}" and issue ${creditsNum} BCC to ${selected.submitterName} (${selected.ngoAddress})?\n\n` +
      `MetaMask will ask you to confirm Marketplace.verifyNGO() (preceded by registerNGO if this NGO has no on-chain record yet). Gas is paid in ETH.`
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      // Real on-chain issuance. If it fails the project stays pending; there is no simulated fallback.
      const result = await tokenTransferService.mintCreditsToNGO(selected.ngoAddress, creditsNum, auditorAddress, selected.submitterName);
      if (!result.success || !result.txHash) {
        alert(`❌ On-chain issuance failed: ${result.error}\n\nThe project is still pending.`);
        return;
      }
      const approval = { projectId: selected.id, txHash: result.txHash, credits: creditsNum, notes: auditNotes };
      try {
        await recordApproval(approval);
        alert(`✅ ${creditsNum} BCC issued to the NGO and the project is approved.\n\n🔗 ${getTxUrl(result.txHash) || result.txHash}`);
      } catch (error) {
        setUnrecorded(approval);
        alert(`⚠️ The credits WERE issued on-chain (${result.txHash}) but the backend could not record the approval: ${errorMessage(error)}\n\nUse "Retry recording" below. Do not approve again.`);
      }
    } finally {
      setBusy(false);
    }
  };

  const rejectProject = async () => {
    if (!selected) return;
    try {
      await api.setProjectStatus(selected.id, { status: 'REJECTED', notes: auditNotes });
      setSelected(null);
      setAuditNotes('');
      await loadProjects();
    } catch (error) {
      alert(`❌ Could not reject the project: ${errorMessage(error)}`);
    }
  };

  const retryRecording = async () => {
    if (!unrecorded) return;
    try {
      await recordApproval(unrecorded);
    } catch (error) {
      alert(`❌ Still failing: ${errorMessage(error)}`);
    }
  };

  if (!authState.isAuthenticated || authState.role !== 'AUDITOR') {
    return <div>Access denied. Auditor role required.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Auditor Dashboard</h1>
            <p className="text-gray-600">Welcome, {authState.user?.name}</p>
            <p className="text-xs font-mono text-gray-500">Wallet to use in MetaMask: {auditorAddress}</p>
          </div>
          <Button onClick={logout} variant="outline">Logout</Button>
        </div>

        {loadError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 text-sm text-red-700">⚠️ {loadError}</CardContent>
          </Card>
        )}

        {unrecorded && (
          <Card className="mb-6 border-yellow-300 bg-yellow-50">
            <CardContent className="p-4 flex items-center justify-between">
              <p className="text-sm text-yellow-800">
                {unrecorded.credits} BCC were issued on-chain (tx {unrecorded.txHash.slice(0, 10)}…) but the approval is not recorded yet.
              </p>
              <Button onClick={retryRecording} size="sm">Retry recording</Button>
            </CardContent>
          </Card>
        )}

        {!isConnected ? (
          <Card className="mb-6 border-purple-200 bg-purple-50">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-purple-800">Connect the auditor wallet</h3>
                <p className="text-sm text-purple-600">Approving a project sends an on-chain transaction that issues the credits</p>
              </div>
              <Button onClick={connectWallet} className="bg-purple-600 hover:bg-purple-700">Connect Wallet</Button>
            </CardContent>
          </Card>
        ) : (
          <Card className={`mb-6 ${walletMismatch ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <CardContent className="p-6">
              {walletMismatch ? (
                <>
                  <h3 className="text-lg font-semibold text-red-800">Wrong wallet connected</h3>
                  <p className="text-sm text-red-600">Connected: {walletAddress}. Switch MetaMask to the auditor wallet {auditorAddress}.</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-green-800">🔗 Auditor wallet connected</h3>
                  <p className="text-sm text-green-600">ETH balance: {ethBalance}</p>
                </>
              )}
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
            <div><p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{pending.length}</p></div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </CardContent></Card>
          <Card><CardContent className="p-6 flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{projects.filter(p => p.status === 'VERIFIED').length}</p></div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </CardContent></Card>
          <Card><CardContent className="p-6 flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">BCC Issued</p>
              <p className="text-2xl font-bold text-purple-600">{projects.reduce((sum, p) => sum + (p.allocatedCredits ?? 0), 0)}</p></div>
            <Award className="w-8 h-8 text-purple-500" />
          </CardContent></Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Review ({pending.length})</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed ({reviewed.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Projects awaiting review</CardTitle>
                  <CardDescription>Select a project to see its evidence and the automated screening report</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pending.length === 0 && <p className="text-center py-8 text-gray-500">No projects waiting for review.</p>}
                  {pending.map(project => (
                    <button
                      key={project.id}
                      onClick={() => select(project)}
                      className={`w-full text-left border rounded-lg p-4 hover:bg-gray-50 ${selected?.id === project.id ? 'border-purple-500 bg-purple-50' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{project.title}</h3>
                        {project.aiReview && <Badge className={reviewColor(project.aiReview.status)}>{project.aiReview.status}</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{project.submitterName} · {project.location}</p>
                      <p className="text-sm text-gray-500">Expected credits: {project.carbonCreditsEstimated}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Review</CardTitle>
                  <CardDescription>{selected ? selected.title : 'Select a project from the list'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selected && (
                    <>
                      <div className="text-sm space-y-1">
                        <p>{selected.description}</p>
                        <p><strong>NGO wallet:</strong> <span className="font-mono text-xs">{selected.ngoAddress}</span></p>
                        <p><strong>Ecosystem:</strong> {selected.ecosystem} · <strong>Area:</strong> {selected.area} ha</p>
                        <p><strong>Coordinates:</strong> {selected.coordinates.latitude}, {selected.coordinates.longitude}</p>
                      </div>

                      {selected.evidenceFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selected.evidenceFiles.map(file => (
                            <a key={file.id} href={api.fileUrl(file.url)} target="_blank" rel="noreferrer">
                              <img src={api.fileUrl(file.url)} alt={file.name} className="h-20 w-28 object-cover rounded border" />
                            </a>
                          ))}
                        </div>
                      )}

                      {selected.aiReview ? (
                        <div className="border rounded-lg p-3 bg-gray-50 text-sm space-y-1">
                          <p className="font-semibold">Automated screening: {selected.aiReview.status} (score {selected.aiReview.score})</p>
                          {selected.aiReview.results.map(r => (
                            <p key={r.file}>
                              <span className="font-medium">{r.file}</span>: {r.ok ? 'passed' : r.issues.join('; ')}
                              {r.signals.greenDominance && ' · vegetation colour detected'}
                            </p>
                          ))}
                          <p className="text-xs text-gray-500">Rule-based pre-check only; the decision is yours.</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No evidence photos were uploaded for this sample project.</p>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-2">Credits to issue (BCC)</label>
                        <Input type="number" value={credits} onChange={e => setCredits(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Audit notes</label>
                        <Textarea value={auditNotes} onChange={e => setAuditNotes(e.target.value)} rows={3} />
                      </div>
                      <div className="flex gap-3">
                        <Button onClick={approveProject} disabled={busy} className="bg-green-600 hover:bg-green-700 flex-1">
                          {busy ? 'Waiting for transaction…' : 'Approve & Issue BCC'}
                        </Button>
                        <Button onClick={rejectProject} disabled={busy} variant="outline" className="flex-1">Reject</Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviewed">
            <Card>
              <CardContent className="p-6 space-y-3">
                {reviewed.length === 0 && <p className="text-center py-8 text-gray-500">Nothing reviewed yet.</p>}
                {reviewed.map(project => (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{project.title}</h3>
                      <div className="flex items-center gap-2">
                        {project.status === 'VERIFIED' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                        <Badge className={project.status === 'VERIFIED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{project.status}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{project.submitterName} · {project.location}</p>
                    {project.status === 'VERIFIED' && (
                      <p className="text-sm text-green-800 mt-1">
                        {project.allocatedCredits} BCC issued
                        {project.mintTxHash && <> — <a className="underline" href={getTxUrl(project.mintTxHash) || undefined} target="_blank" rel="noreferrer">view transaction</a></>}
                      </p>
                    )}
                    {project.verificationNotes && <p className="text-sm text-gray-500 mt-1">Notes: {project.verificationNotes}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
