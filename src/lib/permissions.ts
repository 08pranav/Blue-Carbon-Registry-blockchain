export type UserRole = 'ADMIN' | 'AUDITOR' | 'NGO' | 'BUYER';

export interface Permission {
  action: string;
  allowed: boolean;
  description?: string;
}

export interface RolePermissions {
  [key: string]: Permission;
}

export const PERMISSIONS = {
  // Project Management
  SUBMIT_PROJECTS: 'submitProjects',
  VIEW_ALL_PROJECTS: 'viewAllProjects',
  VIEW_OWN_PROJECTS: 'viewOwnProjects',
  EDIT_PROJECTS: 'editProjects',
  DELETE_PROJECTS: 'deleteProjects',
  
  // Verification & Approval
  APPROVE_PROJECTS: 'approveProjects',
  REJECT_PROJECTS: 'rejectProjects',
  VERIFY_DATA: 'verifyData',
  AUDIT_PROJECTS: 'auditProjects',
  
  // Credits & Trading
  MINT_CREDITS: 'mintCredits',
  BUY_CREDITS: 'buyCredits',
  SELL_CREDITS: 'sellCredits',
  RETIRE_CREDITS: 'retireCredits',
  TRANSFER_CREDITS: 'transferCredits',
  VIEW_MARKETPLACE: 'viewMarketplace',
  
  // Admin Functions
  MANAGE_USERS: 'manageUsers',
  VIEW_ADMIN_DASHBOARD: 'viewAdminDashboard',
  SYSTEM_SETTINGS: 'systemSettings',
  VIEW_ANALYTICS: 'viewAnalytics',
  EXPORT_DATA: 'exportData',
  
  // Data Access
  VIEW_SENSITIVE_DATA: 'viewSensitiveData',
  DOWNLOAD_REPORTS: 'downloadReports',
  VIEW_FINANCIAL_DATA: 'viewFinancialData',
} as const;

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  ADMIN: {
    [PERMISSIONS.SUBMIT_PROJECTS]: { action: 'Submit Projects', allowed: true, description: 'Can submit new restoration projects' },
    [PERMISSIONS.VIEW_ALL_PROJECTS]: { action: 'View All Projects', allowed: true, description: 'Access to all projects in the system' },
    [PERMISSIONS.VIEW_OWN_PROJECTS]: { action: 'View Own Projects', allowed: true, description: 'Access to own submitted projects' },
    [PERMISSIONS.EDIT_PROJECTS]: { action: 'Edit Projects', allowed: true, description: 'Can modify project details' },
    [PERMISSIONS.DELETE_PROJECTS]: { action: 'Delete Projects', allowed: true, description: 'Can remove projects from system' },
    [PERMISSIONS.APPROVE_PROJECTS]: { action: 'Approve Projects', allowed: true, description: 'Can approve project verification' },
    [PERMISSIONS.REJECT_PROJECTS]: { action: 'Reject Projects', allowed: true, description: 'Can reject project applications' },
    [PERMISSIONS.VERIFY_DATA]: { action: 'Verify Data', allowed: true, description: 'Can verify project data and evidence' },
    [PERMISSIONS.AUDIT_PROJECTS]: { action: 'Audit Projects', allowed: true, description: 'Can perform project audits' },
    [PERMISSIONS.MINT_CREDITS]: { action: 'Mint Credits', allowed: true, description: 'Can create new carbon credits' },
    [PERMISSIONS.BUY_CREDITS]: { action: 'Buy Credits', allowed: true, description: 'Can purchase carbon credits' },
    [PERMISSIONS.SELL_CREDITS]: { action: 'Sell Credits', allowed: true, description: 'Can sell carbon credits' },
    [PERMISSIONS.RETIRE_CREDITS]: { action: 'Retire Credits', allowed: true, description: 'Can retire carbon credits' },
    [PERMISSIONS.TRANSFER_CREDITS]: { action: 'Transfer Credits', allowed: true, description: 'Can transfer credits between accounts' },
    [PERMISSIONS.VIEW_MARKETPLACE]: { action: 'View Marketplace', allowed: true, description: 'Access to carbon credit marketplace' },
    [PERMISSIONS.MANAGE_USERS]: { action: 'Manage Users', allowed: true, description: 'Can manage user accounts and permissions' },
    [PERMISSIONS.VIEW_ADMIN_DASHBOARD]: { action: 'View Admin Dashboard', allowed: true, description: 'Access to administrative dashboard' },
    [PERMISSIONS.SYSTEM_SETTINGS]: { action: 'System Settings', allowed: true, description: 'Can modify system configuration' },
    [PERMISSIONS.VIEW_ANALYTICS]: { action: 'View Analytics', allowed: true, description: 'Access to detailed system analytics' },
    [PERMISSIONS.EXPORT_DATA]: { action: 'Export Data', allowed: true, description: 'Can export system data' },
    [PERMISSIONS.VIEW_SENSITIVE_DATA]: { action: 'View Sensitive Data', allowed: true, description: 'Access to sensitive information' },
    [PERMISSIONS.DOWNLOAD_REPORTS]: { action: 'Download Reports', allowed: true, description: 'Can download detailed reports' },
    [PERMISSIONS.VIEW_FINANCIAL_DATA]: { action: 'View Financial Data', allowed: true, description: 'Access to financial information' },
  },
  
  AUDITOR: {
    [PERMISSIONS.SUBMIT_PROJECTS]: { action: 'Submit Projects', allowed: false, description: 'Cannot submit new projects' },
    [PERMISSIONS.VIEW_ALL_PROJECTS]: { action: 'View All Projects', allowed: true, description: 'Full access for auditing and verification' },
    [PERMISSIONS.VIEW_OWN_PROJECTS]: { action: 'View Own Projects', allowed: false, description: 'No own projects' },
    [PERMISSIONS.EDIT_PROJECTS]: { action: 'Edit Projects', allowed: false, description: 'Cannot modify project details' },
    [PERMISSIONS.DELETE_PROJECTS]: { action: 'Delete Projects', allowed: false, description: 'Cannot delete projects' },
    [PERMISSIONS.APPROVE_PROJECTS]: { action: 'Approve Projects', allowed: true, description: 'Can approve project verification' },
    [PERMISSIONS.REJECT_PROJECTS]: { action: 'Reject Projects', allowed: true, description: 'Can reject project applications' },
    [PERMISSIONS.VERIFY_DATA]: { action: 'Verify Data', allowed: true, description: 'Primary role - verify project data and audit' },
    [PERMISSIONS.AUDIT_PROJECTS]: { action: 'Audit Projects', allowed: true, description: 'Can perform comprehensive project audits' },
    [PERMISSIONS.MINT_CREDITS]: { action: 'Mint Credits', allowed: false, description: 'Cannot mint new credits' },
    [PERMISSIONS.BUY_CREDITS]: { action: 'Buy Credits', allowed: false, description: 'Cannot purchase credits (conflict of interest)' },
    [PERMISSIONS.SELL_CREDITS]: { action: 'Sell Credits', allowed: false, description: 'Cannot sell credits' },
    [PERMISSIONS.RETIRE_CREDITS]: { action: 'Retire Credits', allowed: false, description: 'Cannot retire credits' },
    [PERMISSIONS.TRANSFER_CREDITS]: { action: 'Transfer Credits', allowed: false, description: 'Cannot transfer credits' },
    [PERMISSIONS.VIEW_MARKETPLACE]: { action: 'View Marketplace', allowed: true, description: 'Can view for audit and verification purposes' },
    [PERMISSIONS.MANAGE_USERS]: { action: 'Manage Users', allowed: false, description: 'Cannot manage users' },
    [PERMISSIONS.VIEW_ADMIN_DASHBOARD]: { action: 'View Admin Dashboard', allowed: false, description: 'No admin dashboard access' },
    [PERMISSIONS.SYSTEM_SETTINGS]: { action: 'System Settings', allowed: false, description: 'Cannot modify system settings' },
    [PERMISSIONS.VIEW_ANALYTICS]: { action: 'View Analytics', allowed: true, description: 'Full analytics access for auditing and verification' },
    [PERMISSIONS.EXPORT_DATA]: { action: 'Export Data', allowed: true, description: 'Can export audit and verification data' },
    [PERMISSIONS.VIEW_SENSITIVE_DATA]: { action: 'View Sensitive Data', allowed: true, description: 'Full access for audit purposes' },
    [PERMISSIONS.DOWNLOAD_REPORTS]: { action: 'Download Reports', allowed: true, description: 'Can download all reports for verification' },
    [PERMISSIONS.VIEW_FINANCIAL_DATA]: { action: 'View Financial Data', allowed: true, description: 'Full financial access for auditing' },
  },
  
  NGO: {
    [PERMISSIONS.SUBMIT_PROJECTS]: { action: 'Submit Projects', allowed: true, description: 'Primary function - submit restoration projects' },
    [PERMISSIONS.VIEW_ALL_PROJECTS]: { action: 'View All Projects', allowed: false, description: 'Can only view public projects' },
    [PERMISSIONS.VIEW_OWN_PROJECTS]: { action: 'View Own Projects', allowed: true, description: 'Access to own submitted projects' },
    [PERMISSIONS.EDIT_PROJECTS]: { action: 'Edit Projects', allowed: true, description: 'Can edit own projects (if pending)' },
    [PERMISSIONS.DELETE_PROJECTS]: { action: 'Delete Projects', allowed: true, description: 'Can delete own pending projects' },
    [PERMISSIONS.APPROVE_PROJECTS]: { action: 'Approve Projects', allowed: false, description: 'Cannot approve projects' },
    [PERMISSIONS.REJECT_PROJECTS]: { action: 'Reject Projects', allowed: false, description: 'Cannot reject projects' },
    [PERMISSIONS.VERIFY_DATA]: { action: 'Verify Data', allowed: false, description: 'Cannot verify project data' },
    [PERMISSIONS.AUDIT_PROJECTS]: { action: 'Audit Projects', allowed: false, description: 'Cannot audit projects' },
    [PERMISSIONS.MINT_CREDITS]: { action: 'Mint Credits', allowed: false, description: 'Cannot mint credits' },
    [PERMISSIONS.BUY_CREDITS]: { action: 'Buy Credits', allowed: false, description: 'Cannot purchase credits' },
    [PERMISSIONS.SELL_CREDITS]: { action: 'Sell Credits', allowed: true, description: 'Can sell earned credits from projects' },
    [PERMISSIONS.RETIRE_CREDITS]: { action: 'Retire Credits', allowed: true, description: 'Can retire own credits' },
    [PERMISSIONS.TRANSFER_CREDITS]: { action: 'Transfer Credits', allowed: true, description: 'Can transfer own credits' },
    [PERMISSIONS.VIEW_MARKETPLACE]: { action: 'View Marketplace', allowed: true, description: 'Can access marketplace as seller' },
    [PERMISSIONS.MANAGE_USERS]: { action: 'Manage Users', allowed: false, description: 'Cannot manage users' },
    [PERMISSIONS.VIEW_ADMIN_DASHBOARD]: { action: 'View Admin Dashboard', allowed: false, description: 'No admin access' },
    [PERMISSIONS.SYSTEM_SETTINGS]: { action: 'System Settings', allowed: false, description: 'Cannot modify settings' },
    [PERMISSIONS.VIEW_ANALYTICS]: { action: 'View Analytics', allowed: true, description: 'Can view own project analytics' },
    [PERMISSIONS.EXPORT_DATA]: { action: 'Export Data', allowed: true, description: 'Can export own project data' },
    [PERMISSIONS.VIEW_SENSITIVE_DATA]: { action: 'View Sensitive Data', allowed: false, description: 'No sensitive data access' },
    [PERMISSIONS.DOWNLOAD_REPORTS]: { action: 'Download Reports', allowed: true, description: 'Can download own project reports' },
    [PERMISSIONS.VIEW_FINANCIAL_DATA]: { action: 'View Financial Data', allowed: true, description: 'Can view own earnings' },
  },
  
  BUYER: {
    [PERMISSIONS.SUBMIT_PROJECTS]: { action: 'Submit Projects', allowed: false, description: 'Cannot submit projects' },
    [PERMISSIONS.VIEW_ALL_PROJECTS]: { action: 'View All Projects', allowed: true, description: 'Can view verified projects for purchase' },
    [PERMISSIONS.VIEW_OWN_PROJECTS]: { action: 'View Own Projects', allowed: false, description: 'No projects to view' },
    [PERMISSIONS.EDIT_PROJECTS]: { action: 'Edit Projects', allowed: false, description: 'Cannot edit projects' },
    [PERMISSIONS.DELETE_PROJECTS]: { action: 'Delete Projects', allowed: false, description: 'Cannot delete projects' },
    [PERMISSIONS.APPROVE_PROJECTS]: { action: 'Approve Projects', allowed: false, description: 'Cannot approve projects' },
    [PERMISSIONS.REJECT_PROJECTS]: { action: 'Reject Projects', allowed: false, description: 'Cannot reject projects' },
    [PERMISSIONS.VERIFY_DATA]: { action: 'Verify Data', allowed: false, description: 'Cannot verify data' },
    [PERMISSIONS.AUDIT_PROJECTS]: { action: 'Audit Projects', allowed: false, description: 'Cannot audit projects' },
    [PERMISSIONS.MINT_CREDITS]: { action: 'Mint Credits', allowed: false, description: 'Cannot mint credits' },
    [PERMISSIONS.BUY_CREDITS]: { action: 'Buy Credits', allowed: true, description: 'Primary function - purchase credits' },
    [PERMISSIONS.SELL_CREDITS]: { action: 'Sell Credits', allowed: true, description: 'Can resell purchased credits' },
    [PERMISSIONS.RETIRE_CREDITS]: { action: 'Retire Credits', allowed: true, description: 'Can retire purchased credits' },
    [PERMISSIONS.TRANSFER_CREDITS]: { action: 'Transfer Credits', allowed: true, description: 'Can transfer owned credits' },
    [PERMISSIONS.VIEW_MARKETPLACE]: { action: 'View Marketplace', allowed: true, description: 'Primary access - browse marketplace' },
    [PERMISSIONS.MANAGE_USERS]: { action: 'Manage Users', allowed: false, description: 'Cannot manage users' },
    [PERMISSIONS.VIEW_ADMIN_DASHBOARD]: { action: 'View Admin Dashboard', allowed: false, description: 'No admin access' },
    [PERMISSIONS.SYSTEM_SETTINGS]: { action: 'System Settings', allowed: false, description: 'Cannot modify settings' },
    [PERMISSIONS.VIEW_ANALYTICS]: { action: 'View Analytics', allowed: true, description: 'Can view purchase analytics' },
    [PERMISSIONS.EXPORT_DATA]: { action: 'Export Data', allowed: false, description: 'Cannot export system data' },
    [PERMISSIONS.VIEW_SENSITIVE_DATA]: { action: 'View Sensitive Data', allowed: false, description: 'No sensitive data access' },
    [PERMISSIONS.DOWNLOAD_REPORTS]: { action: 'Download Reports', allowed: true, description: 'Can download purchase reports' },
    [PERMISSIONS.VIEW_FINANCIAL_DATA]: { action: 'View Financial Data', allowed: true, description: 'Can view own transactions' },
  },
};

// Helper functions
export function getUserPermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.NGO;
}

export function hasPermission(role: UserRole, permission: string): boolean {
  if (!role) return false;
  const permissions = getUserPermissions(role);
  return permissions && permissions[permission] ? permissions[permission].allowed : false;
}

export function getPermission(role: UserRole, permission: string): Permission | null {
  const permissions = getUserPermissions(role);
  return permissions[permission] || null;
}

export function getAllowedPermissions(role: UserRole): Permission[] {
  const permissions = getUserPermissions(role);
  return Object.values(permissions).filter(p => p.allowed);
}

export function getDeniedPermissions(role: UserRole): Permission[] {
  const permissions = getUserPermissions(role);
  return Object.values(permissions).filter(p => !p.allowed);
}

export function getRoleDisplayName(role: UserRole): string {
  const names = {
    ADMIN: 'System Administrator',
    AUDITOR: 'Project Auditor & Verifier',
    NGO: 'NGO & Community Organization',
    BUYER: 'Carbon Credit Buyer'
  };
  return names[role] || role;
}

export function getRoleDescription(role: UserRole): string {
  const descriptions = {
    ADMIN: 'Full system access with administrative privileges and user management',
    AUDITOR: 'Project verification, data validation, and comprehensive auditing capabilities',
    NGO: 'Submit restoration projects, manage communities, and earn carbon credits',
    BUYER: 'Purchase, retire, and trade carbon credits for offset purposes'
  };
  return descriptions[role] || 'User role';
}
