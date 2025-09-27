# Blue Carbon Registry - 4-Role System Implementation

## Overview
The Blue Carbon Registry has been updated to use a simplified 4-role system instead of the previous 7-role system. This change streamlines user management and improves the overall user experience.

## New Roles

### 1. ADMIN
- **Description**: System administrators with full access
- **Permissions**: All system functions including user management, project verification, carbon credit minting, and system monitoring
- **Badge Color**: Red (destructive)
- **Icon**: Shield

### 2. AUDITOR
- **Description**: Independent auditors and verifiers (merged from VERIFIER and AUDITOR)
- **Permissions**: Project verification, audit access, compliance monitoring
- **Badge Color**: Gray (secondary)
- **Icon**: CheckCircle

### 3. NGO
- **Description**: NGOs and non-profit organizations (merged from NGO and COMMUNITY)
- **Permissions**: Project submission, marketplace access, project management
- **Badge Color**: Blue (default)
- **Icon**: Building2

### 4. BUYER
- **Description**: Carbon credit buyers and corporate entities
- **Permissions**: Marketplace access, credit purchasing and retiring
- **Badge Color**: Gray (outline)
- **Icon**: Coins

## Files Modified

### Core Files
1. **`src/lib/permissions.ts`**
   - Updated UserRole type to only include 4 roles
   - Merged permissions from similar roles
   - Updated role display names and descriptions

2. **`src/contexts/AuthContext.tsx`**
   - Updated to work with new role system
   - Maintained backward compatibility

### Component Updates
3. **`src/components/Header.tsx`**
   - Updated role switcher to show only 4 roles
   - Updated role icons and navigation logic

4. **`src/components/ProtectedRoute.tsx`**
   - Fixed admin access denial to show proper error messages
   - Streamlined redirect logic

### Page Updates
5. **`src/pages/Login.tsx`**
   - Updated demo user roles to use 4-role system

6. **`src/pages/Register.tsx`**
   - Updated role selection to exclude ADMIN (NGO, AUDITOR, BUYER only)
   - Changed default role to NGO

7. **`src/pages/AuthDemo.tsx`**
   - Updated mock users and role functions
   - Removed references to old roles
   - Updated role-based content sections

8. **`src/pages/Dashboard.tsx`**
   - Updated mock stats to only include 4 roles
   - Added access denied notification handling
   - Fixed role fallback logic

9. **`src/pages/Profile.tsx`**
   - Updated role badge variants and labels

10. **`src/pages/Admin.tsx`**
    - Replaced with simplified AdminDashboard component

11. **`src/pages/AdminDashboard.tsx`**
    - Updated mock data to use 4 roles
    - Added user role management functionality
    - Added "Make Admin" and "Change Role" features

## Admin Management Features

### User Role Management
- Admins can now promote users to admin role
- Dropdown to change user roles between NGO, AUDITOR, BUYER, and ADMIN
- Clear role badges and status indicators

### Access Control
- Proper admin access protection
- Clear error messages for unauthorized access
- Redirect with notifications for access denied scenarios

## Registration Flow
- New users can only register as NGO, AUDITOR, or BUYER
- ADMIN role can only be assigned by existing administrators
- Default registration role is NGO

## Key Benefits
1. **Simplified User Experience**: Fewer role options reduce confusion
2. **Better Permission Management**: Clearer role boundaries and responsibilities
3. **Enhanced Admin Control**: Easy user role management and promotion
4. **Streamlined Navigation**: Role-based UI is more intuitive
5. **Future-Ready**: System is prepared for additional features and scaling

## Testing
The application has been tested with:
- Role switching functionality
- Admin access protection
- User registration with role selection
- Navigation based on user roles
- Permission-based content visibility

## Next Steps
1. Backend integration for role management APIs
2. Real-time role updates across sessions
3. Audit logging for role changes
4. Enhanced role-based dashboard customization
5. Mobile navigation improvements