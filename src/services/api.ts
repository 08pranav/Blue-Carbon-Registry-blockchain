const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.bluecarbon.org' 
  : 'http://localhost:3001';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'AUDITOR' | 'NGO' | 'BUYER';
  organization: string;
  isEmailVerified: boolean;
  createdAt: string;
  projectsCount?: number;
  creditsEarned?: number;
  lastActive?: string;
  status?: string;
  location?: string;
}

interface Project {
  id: string;
  title?: string;
  name?: string;
  description: string;
  ecosystem: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  area: number;
  carbonCreditsEstimated?: number;
  carbonEstimate?: number;
  carbonCreditsIssued?: number;
  species?: string;
  methodology?: string;
  timeline?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  submitterId: string;
  submitter?: string;
  submitterName?: string;
  submitterOrganization?: string;
  evidenceFiles: Array<{
    id?: string;
    name?: string;
    filename?: string;
    url?: string;
    size?: number;
    type?: string;
    uploadedAt?: string;
  }>;
  submissionDate?: string;
  lastUpdated?: string;
  verificationNotes?: string;
  verifiedAt?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface AdminStats {
  overview: {
    totalProjects: number;
    pendingProjects: number;
    verifiedProjects: number;
    totalCredits: number;
    totalCarbonIssued: number;
  };
  recentProjects: Project[];
  totalUsers: number;
  monthlyGrowth: number;
  verifiedProjects: number;
  pendingVerification: number;
  totalCarbonCredits: number;
  activeCredits: number;
  retiredCredits: number;
  totalRevenue: number;
}

interface Verification {
  id: string;
  name: string;
  submitter: {
    name: string;
    organization: string;
    email: string;
  };
  ecosystemType: string;
  location: string;
  areaSize: number;
  estimatedCarbonCapture: number;
  submissionTimestamp: string;
  evidenceFiles: Array<{
    id: string;
    name: string;
    url: string;
  }>;
  status: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface MarketplaceListing {
  id: string;
  projectId: string;
  projectName: string;
  credits: number;
  pricePerCredit: number;
  totalPrice: number;
  vintage: string;
  certification: string;
  location: string;
  seller: string;
  listedDate: string;
  status: string;
  ecosystem: string;
  area: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface MarketStats {
  totalVolume: number;
  averagePrice: number;
  activeListings: number;
  dailyChange: string;
}

interface Transaction {
  id: string;
  listingId: string;
  projectId: string;
  projectName: string;
  credits: number;
  pricePerCredit: number;
  totalAmount: number;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  paymentMethod: string;
  status: string;
  transactionDate: string;
  blockchainTxHash: string;
  carbonCreditsRetired: boolean;
  retiredAt?: string;
}

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      localStorage.setItem('auth-token', response.token);
    }
    
    return response;
  }

  async getProfile(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/profile');
  }

  // Projects
  async getProjects(params?: { role?: string; userId?: string }): Promise<{ projects: Project[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.role) queryParams.append('role', params.role);
      if (params?.userId) queryParams.append('userId', params.userId);
      
      const queryString = queryParams.toString();
      return this.request<{ projects: Project[]; total: number }>(
        `/projects${queryString ? `?${queryString}` : ''}`
      );
    } catch (error) {
      // Fallback to mock data for demo
      console.log('API failed, using mock projects data');
      return {
        projects: [
          {
            id: 'proj1',
            name: 'Sundarbans Mangrove Restoration',
            title: 'Sundarbans Mangrove Restoration',
            description: 'Large-scale mangrove restoration project in the Sundarbans',
            ecosystem: 'MANGROVE',
            location: 'Sundarbans, West Bengal',
            coordinates: { latitude: 21.9497, longitude: 88.4297 },
            area: 150,
            carbonCreditsEstimated: 2250,
            carbonEstimate: 2250,
            carbonCreditsIssued: 0,
            status: 'PENDING' as const,
            submitterId: 'user3',
            submitter: 'Anjali Patel',
            submitterName: 'Anjali Patel',
            submitterOrganization: 'Ocean Conservation NGO',
            evidenceFiles: [],
            submissionDate: '2024-09-15T10:30:00Z',
            lastUpdated: '2024-09-20T14:20:00Z',
            priority: 'MEDIUM' as const
          },
          {
            id: 'proj2',
            name: 'Kerala Backwater Seagrass Conservation',
            title: 'Kerala Backwater Seagrass Conservation',
            description: 'Seagrass meadow restoration in Kerala backwaters',
            ecosystem: 'SEAGRASS',
            location: 'Vembanad Lake, Kerala',
            coordinates: { latitude: 9.5981, longitude: 76.4619 },
            area: 75,
            carbonCreditsEstimated: 975,
            carbonEstimate: 975,
            carbonCreditsIssued: 0,
            status: 'UNDER_REVIEW' as const,
            submitterId: 'user3',
            submitter: 'Anjali Patel',
            submitterName: 'Anjali Patel',
            submitterOrganization: 'Ocean Conservation NGO',
            evidenceFiles: [],
            submissionDate: '2024-09-10T08:15:00Z',
            lastUpdated: '2024-09-18T11:45:00Z',
            priority: 'HIGH' as const
          }
        ],
        total: 2
      };
    }
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  async submitProject(projectData: FormData): Promise<{ message: string; project: Project }> {
    const token = localStorage.getItem('auth-token');
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: projectData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  async updateProjectStatus(
    id: string, 
    status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED', 
    notes?: string
  ): Promise<{ message: string; project: Project }> {
    return this.request<{ message: string; project: Project }>(`/projects/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Verifications (for auditors)
  async getPendingVerifications(): Promise<{ verifications: Verification[] }> {
    return this.request<{ verifications: Verification[] }>('/verifications/pending');
  }

  // Admin endpoints
  async getAdminStats(): Promise<AdminStats> {
    try {
      return this.request<AdminStats>('/admin/stats');
    } catch (error) {
      // Fallback to mock data for demo
      console.log('API failed, using mock admin stats');
      return {
        overview: {
          totalProjects: 156,
          pendingProjects: 23,
          verifiedProjects: 98,
          totalCredits: 125000,
          totalCarbonIssued: 89500
        },
        recentProjects: [],
        totalUsers: 1247,
        monthlyGrowth: 12,
        verifiedProjects: 98,
        pendingVerification: 23,
        totalCarbonCredits: 125000,
        activeCredits: 89500,
        retiredCredits: 35500,
        totalRevenue: 2850000
      };
    }
  }

  async getAdminUsers(): Promise<{
    users: Array<User & { _count: { submittedProjects: number } }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      return this.request('/admin/users');
    } catch (error) {
      // Fallback to mock data for demo
      console.log('API failed, using mock admin users');
      return {
        users: [
          {
            id: 'user1',
            name: 'Dr. Rajesh Kumar',
            email: 'admin@bluecarbon.org',
            role: 'ADMIN' as const,
            organization: 'NCCR',
            isEmailVerified: true,
            createdAt: '2024-01-15T10:30:00Z',
            _count: { submittedProjects: 0 },
            projectsCount: 0,
            creditsEarned: 0,
            lastActive: '2 hours ago',
            status: 'ACTIVE',
            location: 'New Delhi'
          },
          {
            id: 'user2',
            name: 'Priya Sharma',
            email: 'auditor@coastal.org',
            role: 'AUDITOR' as const,
            organization: 'Coastal Research Institute',
            isEmailVerified: true,
            createdAt: '2024-02-10T14:20:00Z',
            _count: { submittedProjects: 0 },
            projectsCount: 0,
            creditsEarned: 0,
            lastActive: '1 hour ago',
            status: 'ACTIVE',
            location: 'Mumbai'
          },
          {
            id: 'user3',
            name: 'Anjali Patel',
            email: 'ngo@ocean.org',
            role: 'NGO' as const,
            organization: 'Ocean Conservation NGO',
            isEmailVerified: true,
            createdAt: '2024-03-05T09:15:00Z',
            _count: { submittedProjects: 8 },
            projectsCount: 8,
            creditsEarned: 12750,
            lastActive: '30 minutes ago',
            status: 'ACTIVE',
            location: 'Kochi'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          pages: 1
        }
      };
    }
  }

  // File upload
  async uploadFile(file: File): Promise<{
    message: string;
    file: {
      id: string;
      name: string;
      filename: string;
      url: string;
      size: number;
      type: string;
    };
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth-token');
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || `Upload failed: HTTP ${response.status}`);
    }

    return await response.json();
  }

  // Marketplace endpoints
  async getMarketplaceListings(): Promise<{
    listings: MarketplaceListing[];
    marketStats: MarketStats;
  }> {
    return this.request<{
      listings: MarketplaceListing[];
      marketStats: MarketStats;
    }>('/marketplace/listings');
  }

  async purchaseCredits(purchaseData: {
    listingId: string;
    quantity: number;
    buyerId: string;
    buyerName: string;
    paymentMethod?: string;
  }): Promise<{
    message: string;
    transaction: Transaction;
  }> {
    return this.request<{
      message: string;
      transaction: Transaction;
    }>('/marketplace/purchase', {
      method: 'POST',
      body: JSON.stringify(purchaseData),
    });
  }

  async getTransactions(params?: {
    userId?: string;
    role?: string;
  }): Promise<{
    transactions: Transaction[];
  }> {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.role) queryParams.append('role', params.role);
    
    const queryString = queryParams.toString();
    return this.request<{
      transactions: Transaction[];
    }>(`/marketplace/transactions${queryString ? `?${queryString}` : ''}`);
  }

  async retireCredits(transactionId: string): Promise<{
    message: string;
    transaction: Transaction;
  }> {
    return this.request<{
      message: string;
      transaction: Transaction;
    }>(`/marketplace/transactions/${transactionId}/retire`, {
      method: 'PATCH',
    });
  }


  // Health check
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    projects: number;
    users: number;
    transactions?: number;
    marketplaceListings?: number;
  }> {
    return this.request<{
      status: string;
      timestamp: string;
      projects: number;
      users: number;
      transactions?: number;
      marketplaceListings?: number;
    }>('/health');
  }
}

export const apiService = new ApiService();
export type { User, Project, AdminStats, Verification, MarketplaceListing, MarketStats, Transaction };
