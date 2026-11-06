// Typed client for the Express backend (backend/app.js, also served by the Vercel function in api/).
// Requests go to same-origin /api by default: the Vite dev server proxies it to :3001 and on
// Vercel it is the serverless function. Set VITE_API_BASE_URL to point at a separate API host.
import { errorMessage } from '@/lib/errors';

const BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export type ProjectStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
export type Ecosystem = 'MANGROVE' | 'SEAGRASS' | 'SALT_MARSH';

export interface EvidenceCheck {
  file: string;
  ok: boolean;
  issues: string[];
  signals: { filenameKeyword: boolean; greenDominance: boolean };
}

export interface AiReview {
  status: 'APPROVE' | 'NEEDS_REVIEW' | 'REJECT';
  score: number;
  results: EvidenceCheck[];
  ecosystem: Ecosystem;
  semanticOk: boolean;
  basicPass: boolean;
}

export interface EvidenceFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  ecosystem: Ecosystem;
  location: string;
  coordinates: { latitude: number; longitude: number };
  area: number;
  carbonCreditsEstimated: number;
  status: ProjectStatus;
  ngoAddress: string;
  submitterName: string;
  evidenceFiles: EvidenceFile[];
  aiReview?: AiReview;
  submissionDate: string;
  allocatedCredits?: number;
  mintTxHash?: string;
  verificationNotes?: string;
}

export interface Listing {
  id: string;
  projectId: string;
  projectName: string;
  description: string;
  ecosystem: Ecosystem;
  location: string;
  ngoAddress: string;
  ngoName: string;
  credits: number;
  pricePerCredit: string; // ETH per credit
  vintage: string;
  certification: string;
  mintTxHash?: string;
}

export class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, init);
  } catch (error) {
    throw new ApiError(`Cannot reach the API (${errorMessage(error)}). Is the backend running?`);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError((body as { error?: string }).error ?? `Request failed (${res.status})`);
  return body as T;
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const api = {
  /** Projects visible to a role. NGOs pass their wallet address as userId. */
  listProjects: (role: 'NGO' | 'AUDITOR' | 'BUYER', userId?: string) =>
    request<{ projects: Project[] }>(`/api/projects?role=${role}${userId ? `&userId=${encodeURIComponent(userId)}` : ''}`).then(r => r.projects),

  submitProject: (form: FormData) =>
    request<{ project: Project; aiReview: AiReview; message: string }>('/api/projects', { method: 'POST', body: form }),

  setProjectStatus: (id: string, body: { status: ProjectStatus; notes?: string; allocatedCredits?: number; mintTxHash?: string }) =>
    request<{ project: Project }>(`/api/projects/${id}/status`, jsonInit('PATCH', body)),

  listListings: () => request<{ listings: Listing[] }>('/api/marketplace/listings').then(r => r.listings),

  upsertListing: (body: { projectId: string; credits: number; pricePerCredit: number; ngoAddress: string }) =>
    request<{ listing: Listing }>('/api/marketplace/listings', jsonInit('POST', body)).then(r => r.listing),

  recordPurchase: (body: { listingId: string; quantity: number; buyerAddress: string; txHash: string }) =>
    request<{ transaction: { id: string } }>('/api/marketplace/purchase', jsonInit('POST', body)),

  /** Absolute URL for an uploaded evidence file. */
  fileUrl: (path: string) => `${BASE}${path}`,
};
