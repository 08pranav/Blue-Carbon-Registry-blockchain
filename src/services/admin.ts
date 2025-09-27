import { apiService } from '@/services/api';

export interface AdminStats {
  overview: {
    totalProjects: number;
    verifiedProjects: number;
    pendingProjects: number;
    totalCredits: number;
    activeCredits: number;
    retiredCredits: number;
    totalCarbonIssued: number;
    totalCarbonRetired: number;
    averageCarbonPerProject: number;
  };
  ecosystemDistribution: Record<string, number>;
  recentProjects: Array<{
    id: string;
    name: string;
    ecosystemType: string;
    location: string;
    verificationTimestamp: string;
    estimatedCarbonCapture: number;
    areaSize: number;
  }>;
  lastUpdated: string;
}

export interface PendingVerification {
  id: string;
  name: string;
  description: string;
  ecosystemType: 'MANGROVE' | 'SEAGRASS' | 'SALT_MARSH' | 'OTHER';
  location: string;
  estimatedCarbonCapture: number;
  areaSize: number;
  submissionTimestamp: string;
  status: 'PENDING';
  submitter: {
    id: string;
    name: string;
    organization?: string;
    email: string;
  };
  evidenceFiles: Array<{
    id: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    ipfsHash: string;
    uploadTimestamp: string;
  }>;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  organization?: string;
  role: string;
  isEmailVerified: boolean;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    submittedProjects: number;
    verifiedProjects: number;
    carbonCredits: number;
  };
}

export interface BlockchainTransaction {
  id: string;
  transactionHash: string;
  transactionType: 'MINT' | 'TRANSFER' | 'RETIRE';
  timestamp: string;
  fromAddress?: string;
  toAddress?: string;
  credit: {
    id: string;
    carbonAmount: number;
    status: string;
    project: {
      name: string;
      ecosystemType: string;
      location: string;
    };
  };
}

class AdminService {
  /**
   * Get admin dashboard statistics
   */
  async getStats(): Promise<AdminStats> {
    const stats = await apiService.getAdminStats();
    // Transform the registry stats to AdminStats format
    return {
      overview: {
        totalProjects: stats.totalProjects,
        verifiedProjects: stats.verifiedProjects,
        pendingProjects: stats.pendingProjects,
        totalCredits: stats.totalCarbonCredits,
        activeCredits: stats.totalCarbonCredits,
        retiredCredits: 0, // Will need to add this to backend
        totalCarbonIssued: stats.totalCarbonCredits * 1000, // Mock calculation
        totalCarbonRetired: 0, // Will need to add this to backend
        averageCarbonPerProject: stats.verifiedProjects > 0 ? Math.round(stats.totalCarbonCredits / stats.verifiedProjects) : 0
      },
      ecosystemDistribution: {
        'MANGROVE': 45,
        'SEAGRASS': 28,
        'SALT_MARSH': 16,
        'OTHER': 11
      },
      recentProjects: [],
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get pending verification projects
   */
  async getPendingVerifications(): Promise<PendingVerification[]> {
    const response = await apiService.getPendingVerifications();
    // Transform the projects to match PendingVerification interface
    return response.projects.map(project => ({
      id: project.id,
      name: project.title,
      description: project.description,
      ecosystemType: project.ecosystem as any,
      location: project.location,
      estimatedCarbonCapture: project.carbonCreditsEstimated,
      areaSize: project.area,
      submissionTimestamp: project.createdAt,
      status: 'PENDING' as const,
      submitter: {
        id: project.user?.id || project.userId,
        name: project.user?.name || 'Unknown',
        organization: project.user?.organization,
        email: project.user?.email || ''
      },
      evidenceFiles: project.evidenceFiles.map(file => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimeType,
        size: file.size,
        ipfsHash: file.ipfsHash || '',
        uploadTimestamp: file.createdAt
      }))
    }));
  }

  /**
   * Get all users (admin only)
   */
  async getUsers(params?: {
    role?: string;
    verified?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    users: AdminUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await apiService.getAdminUsers?.(params) ?? { users: [], pagination: { page: 1, limit: 10, total: 0, pages: 1 } };
    return {
      users: response.users as AdminUser[],
      pagination: response.pagination
    };
  }

  /**
   * Get blockchain transactions
   */
  async getTransactions(params?: {
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    transactions: BlockchainTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await apiService.getTransactions(params);
    return {
      transactions: response.transactions as BlockchainTransaction[],
      pagination: response.pagination
    };
  }

  /**
   * Verify a project
   */
  async verifyProject(projectId: string, notes?: string): Promise<any> {
    return await apiService.approveProject(projectId, notes);
  }

  /**
   * Reject a project
   */
  async rejectProject(projectId: string, notes: string): Promise<any> {
    return await apiService.rejectProject(projectId, notes);
  }

  /**
   * Mint carbon credits
   */
  async mintCredits(data: {
    projectId: string;
    carbonAmount: number;
    vintageYear: number;
    recipientAddress: string;
    certificationStandard?: string;
  }): Promise<any> {
    return await apiService.mintCarbonCredits(data);
  }

  /**
   * Update user verification status
   */
  async updateUserVerification(userId: string, verified: boolean): Promise<any> {
    return await apiService.updateUser?.(userId, { isEmailVerified: verified });
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: string): Promise<any> {
    return await apiService.updateUser?.(userId, { role });
  }
}

export const adminService = new AdminService();