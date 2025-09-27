// API Client for Blue Carbon Registry Backend
import { toast } from "sonner";

import { apiConfig } from '@/lib/config';

// Backend Configuration
const API_BASE_URL = apiConfig.baseUrl;

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'AUDITOR' | 'NGO' | 'BUYER';
  organization?: string;
  walletAddress?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    submittedProjects: number;
    verifiedProjects: number;
    carbonCredits: number;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  ecosystem: 'MANGROVE' | 'SEAGRASS' | 'SALT_MARSH';
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  area: number;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  userId: string;
  verifierId?: string;
  carbonCreditsEstimated: number;
  carbonCreditsIssued: number;
  evidenceFiles: EvidenceFile[];
  tokenId?: string;
  blockchainTxHash?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  verifier?: User;
}

export interface EvidenceFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  ipfsHash?: string;
  projectId: string;
  createdAt: string;
}

export interface CarbonCredit {
  id: string;
  projectId: string;
  amount: number;
  tokenId: string;
  status: 'MINTED' | 'TRADED' | 'RETIRED';
  currentOwner: string;
  blockchainTxHash: string;
  createdAt: string;
  project?: Project;
}

export interface RegistryStats {
  totalProjects: number;
  verifiedProjects: number;
  pendingProjects: number;
  rejectedProjects: number;
  totalCarbonCredits: number;
  totalUsers: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth-token');
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      
      return response.text() as T;
    } catch (error) {
      console.error('API Request Error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
    }
  }

  private async uploadRequest<T>(
    endpoint: string,
    formData: FormData
  ): Promise<T> {
    const token = localStorage.getItem('auth-token');
    
    const config: RequestInit = {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API Upload Error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
    }
  }

  // Authentication
  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ user: User; token: string; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('auth-token', response.token);
    }
    
    return response;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    organization?: string;
    role?: string;
  }) {
    const response = await this.request<{ user: User; token: string; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('auth-token', response.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request<{ message: string }>('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      localStorage.removeItem('auth-token');
    }
  }

  async getProfile() {
    return this.request<{ user: User }>('/api/auth/profile');
  }

  async updateProfile(profileData: {
    name?: string;
    organization?: string;
    walletAddress?: string;
  }) {
    return this.request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Projects
  async getProjects() {
    return this.request<{ projects: Project[] }>('/api/projects');
  }

  async getProject(id: string) {
    return this.request<{ project: Project }>(`/api/projects/${id}`);
  }

  async getUserProjects() {
    return this.request<{ projects: Project[] }>('/api/projects/user');
  }

  async createProject(projectData: {
    title: string;
    description: string;
    ecosystem: string;
    location: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    area: number;
    carbonCreditsEstimated: number;
  }) {
    return this.request<{ project: Project }>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: string, projectData: Partial<Project>) {
    return this.request<{ project: Project }>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string) {
    return this.request<{ message: string }>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // File uploads
  async uploadFiles(projectId: string, files: File[]) {
    const formData = new FormData();
    formData.append('projectId', projectId);
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    return this.uploadRequest<{ files: EvidenceFile[] }>('/api/upload/files', formData);
  }

  async getFile(fileId: string) {
    return this.request<Blob>(`/api/upload/files/${fileId}`, {
      headers: {
        'Accept': '*/*',
      },
    });
  }

  // Registry (Public endpoints)
  async getRegistryProjects(params?: {
    status?: string;
    ecosystem?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/registry/projects?${queryString}` : '/api/registry/projects';
    
    return this.request<{ projects: Project[]; pagination?: any }>(endpoint);
  }

  async getRegistryStats() {
    return this.request<RegistryStats>('/api/registry/stats');
  }

  async getPublicProject(id: string) {
    return this.request<{ project: Project }>(`/api/registry/projects/${id}`);
  }

  // Verification (Admin/Verifier endpoints)
  async getPendingProjects() {
    return this.request<{ projects: Project[] }>('/api/verification/pending');
  }


  // Admin - User Management
  async getUsers(params?: {
    role?: string;
    verified?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/auth/users?${queryString}` : '/api/auth/users';
    
    return this.request<{
      users: User[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(endpoint);
  }

  async updateUser(userId: string, updates: { role?: string; isEmailVerified?: boolean }) {
    return this.request<{ user: User; message: string }>(`/api/auth/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Verification - Enhanced
  async approveProject(projectId: string, notes?: string) {
    return this.request<{ project: Project; message: string }>(`/api/verification/${projectId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async rejectProject(projectId: string, notes: string) {
    return this.request<{ project: Project; message: string }>(`/api/verification/${projectId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  // Blockchain - Enhanced
  async mintCarbonCredits(data: {
    projectId: string;
    carbonAmount: number;
    vintageYear: number;
    recipientAddress: string;
    certificationStandard?: string;
  }) {
    return this.request<{ credit: any; transactionHash: string; message: string }>('/api/blockchain/mint-credits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransactions(params?: {
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/blockchain/transactions?${queryString}` : '/api/blockchain/transactions';
    
    return this.request<{
      transactions: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(endpoint);
  }

  async getCarbonCredits(projectId?: string) {
    const endpoint = projectId 
      ? `/api/blockchain/credits?projectId=${projectId}`
      : '/api/blockchain/credits';
    
    return this.request<{ credits: CarbonCredit[] }>(endpoint);
  }

  async transferCredits(tokenId: string, to: string, amount: number) {
    return this.request<{ transaction: any }>('/api/blockchain/transfer-credits', {
      method: 'POST',
      body: JSON.stringify({ tokenId, to, amount }),
    });
  }

  // Utility methods
  getFileUrl(fileId: string) {
    return `${this.baseURL}/api/upload/files/${fileId}`;
  }

  getIPFSUrl(hash: string) {
    const ipfsGateway = 'https://ipfs.io/ipfs/';
    return `${ipfsGateway}${hash}`;
  }
}

// Create and export API client instance
export const api = new ApiClient(API_BASE_URL);

// Export individual API modules for cleaner imports
export const authAPI = {
  login: api.login.bind(api),
  register: api.register.bind(api),
  logout: api.logout.bind(api),
  getProfile: api.getProfile.bind(api),
  updateProfile: api.updateProfile.bind(api),
};

export const projectsAPI = {
  getProjects: api.getProjects.bind(api),
  getProject: api.getProject.bind(api),
  getUserProjects: api.getUserProjects.bind(api),
  createProject: api.createProject.bind(api),
  updateProject: api.updateProject.bind(api),
  deleteProject: api.deleteProject.bind(api),
};

export const registryAPI = {
  getProjects: api.getRegistryProjects.bind(api),
  getStats: api.getRegistryStats.bind(api),
  getProject: api.getPublicProject.bind(api),
};

export const uploadAPI = {
  uploadFiles: api.uploadFiles.bind(api),
  getFile: api.getFile.bind(api),
  getFileUrl: api.getFileUrl.bind(api),
  getIPFSUrl: api.getIPFSUrl.bind(api),
};

export const verificationAPI = {
  getPendingProjects: api.getPendingProjects.bind(api),
  approveProject: api.approveProject.bind(api),
  rejectProject: api.rejectProject.bind(api),
};

export const blockchainAPI = {
  mintCarbonCredits: api.mintCarbonCredits.bind(api),
  getCarbonCredits: api.getCarbonCredits.bind(api),
  transferCredits: api.transferCredits.bind(api),
  getTransactions: api.getTransactions.bind(api),
};

export const adminAPI = {
  getUsers: api.getUsers.bind(api),
  updateUser: api.updateUser.bind(api),
};

export default api;