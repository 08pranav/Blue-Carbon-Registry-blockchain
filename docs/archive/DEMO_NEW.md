# Blue Carbon Registry - Demo & Features Guide

## 🌊 Overview
The Blue Carbon Registry is a comprehensive blockchain-based platform for managing blue carbon projects, verification, and carbon credit trading. The platform supports coastal ecosystem restoration projects including mangroves, seagrass beds, and salt marshes.

## 🚀 Quick Start Demo

### Login with Demo Accounts
Access the app at: `http://localhost:8081`

**Demo Accounts:**
- **Admin**: `admin@bluecarbon.org` / `demo123`
- **Auditor**: `auditor@coastal.org` / `demo123` 
- **NGO**: `ngo@ocean.org` / `demo123`
- **Buyer**: `buyer@corp.com` / `demo123`

Or use the Quick Demo Login buttons on the login page.

## 🎯 Core Features

### 1. Authentication & User Management
- ✅ **Role-Based Access Control**: 4 distinct user roles
- ✅ **Secure Login/Registration**: JWT-based authentication
- ✅ **Profile Management**: Update personal and organization details
- ✅ **Demo Mode**: Quick testing with role switching

### 2. Dashboard System
- ✅ **Role-Specific Dashboards**: Customized for each user type
- ✅ **Real-time Statistics**: Project counts, carbon credits, revenue
- ✅ **Quick Actions**: Role-appropriate action buttons
- ✅ **Activity Feed**: Recent system updates and notifications

### 3. Project Management System
- 📝 **Project Submission** (NGO Role)
  - Ecosystem type selection (Mangrove, Seagrass, Salt Marsh)
  - Location mapping and area calculation
  - Evidence file uploads (photos, documents, reports)
  - Carbon sequestration estimation
  - Methodology selection (VCS, CDM, Gold Standard)

- 🔍 **Project Verification** (Auditor Role)
  - Verification queue management
  - Evidence review and validation
  - Site visit scheduling and reporting
  - MRV (Monitoring, Reporting, Verification) compliance
  - Approval/rejection workflow

- 🎯 **Project Tracking**
  - Real-time project status updates
  - Timeline and milestone tracking
  - Document version control
  - Communication logs

### 4. Carbon Credit Marketplace
- 💰 **Credit Trading** (Buyer Role)
  - Browse available carbon credits
  - Filter by ecosystem type, location, price
  - Purchase and retirement functionality
  - Portfolio management
  - Transaction history

- 📊 **Market Analytics**
  - Price trends and market data
  - Supply and demand insights
  - Carbon offset calculator
  - Impact reporting

### 5. Blockchain Integration
- ⛓️ **Credit Tokenization**: Convert verified projects to blockchain tokens
- 🔒 **Immutable Records**: Transparent transaction history
- 🌍 **Global Registry**: Decentralized carbon credit database
- 📋 **Smart Contracts**: Automated credit issuance and retirement

### 6. Admin Management System
- 👥 **User Administration**
  - User role management and promotion
  - Account verification and suspension
  - Organization onboarding
  - Permissions management

- 🏛️ **System Monitoring**
  - Platform analytics and reporting
  - Verification queue oversight
  - Revenue and transaction monitoring
  - System health and performance metrics

### 7. Reporting & Analytics
- 📈 **Impact Reporting**
  - Carbon sequestration metrics
  - Ecosystem restoration progress
  - Biodiversity impact assessment
  - SDG (Sustainable Development Goals) alignment

- 📊 **Business Intelligence**
  - Revenue analysis and forecasting
  - User engagement metrics
  - Market trend analysis
  - Custom report generation

## 🎭 User Roles & Permissions

### 🛡️ ADMIN (System Administrator)
**Access**: Everything
- User management and role assignment
- System configuration and monitoring
- Platform analytics and reporting
- Carbon credit minting and oversight
- Verification process management

### 🔍 AUDITOR (Verifier/Auditor)
**Access**: Verification & Compliance
- Review and verify submitted projects
- Conduct site visits and assessments
- Generate verification reports
- Monitor compliance with standards
- Access to MRV data and tools

### 🏢 NGO (Non-Profit Organizations)
**Access**: Project Management
- Submit new restoration projects
- Upload evidence and documentation
- Track project progress and status
- Sell earned carbon credits
- Access to project dashboard

### 💼 BUYER (Carbon Credit Purchaser)
**Access**: Marketplace & Trading
- Browse and purchase carbon credits
- Manage credit portfolio
- Retire credits for offsetting
- Access to market analytics
- Transaction history and reporting

## 🛠️ Technical Features

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **React Router** for navigation
- **React Query** for API state management
- **Zustand** for local state management

### Key Components
- **Authentication System**: JWT-based with role management
- **Dashboard Framework**: Modular and role-specific
- **File Upload System**: Support for multiple file types
- **Map Integration**: Interactive location selection
- **Chart Components**: Data visualization
- **Notification System**: Real-time updates

### API Integration
- **RESTful APIs**: Standard HTTP methods
- **Authentication**: Bearer token system
- **File Upload**: Multipart form support
- **Error Handling**: Comprehensive error management
- **Caching**: Optimistic updates and caching

## 📱 Pages & Navigation

### Public Pages
- **Landing Page** (`/`): Platform overview and features
- **Registry** (`/registry`): Public project registry
- **Login** (`/login`): Authentication with demo accounts
- **Register** (`/register`): New user registration

### Protected Pages
- **Dashboard** (`/dashboard`): Role-specific main dashboard
- **Projects** (`/projects`): Project management interface
- **Submit Project** (`/submit`): New project submission form
- **Verification** (`/verification`): Auditor verification interface
- **Marketplace** (`/marketplace`): Carbon credit trading platform
- **Analytics** (`/analytics`): Data analytics and reporting
- **Profile** (`/profile`): User profile management
- **Admin Panel** (`/admin`): Administrative interface

### Dynamic Pages
- **Project Details** (`/projects/:id`): Individual project view
- **Credit Details** (`/credits/:id`): Carbon credit information
- **User Profile** (`/users/:id`): Public user profiles

## 🔄 Workflow Examples

### Project Submission to Credit Sale
1. **NGO** submits restoration project with evidence
2. **System** validates submission and assigns to queue
3. **Auditor** reviews project and conducts verification
4. **System** issues carbon credits upon approval
5. **Blockchain** tokenizes credits for trading
6. **NGO** lists credits on marketplace
7. **Buyer** purchases credits for offsetting
8. **System** retires credits and updates registry

### User Onboarding
1. User registers with role selection (NGO/Auditor/Buyer)
2. Email verification and profile completion
3. Organization verification (for institutional users)
4. Role-specific onboarding tutorial
5. Dashboard customization and setup

## 📊 Demo Data & Scenarios

### Sample Projects
- **Sundarbans Mangrove Restoration** (West Bengal, India)
- **Kerala Seagrass Conservation** (Kerala, India)
- **Gujarat Salt Marsh Rehabilitation** (Gujarat, India)

### Test Scenarios
1. **Complete Project Lifecycle**: Submission → Verification → Credit Issuance → Sale
2. **Multi-role Testing**: Switch between roles to test different perspectives
3. **Marketplace Trading**: Buy and sell credits with different users
4. **Admin Management**: Manage users and oversee system operations

## 🚨 Important Notes

### Demo Limitations
- **Mock Backend**: Some features use simulated data
- **File Storage**: Uploads stored locally (not persistent)
- **Blockchain**: Simulated blockchain interactions
- **Payments**: Mock payment processing

### Production Readiness
- Real backend API integration required
- Blockchain network deployment needed
- File storage service setup (AWS S3, etc.)
- Payment gateway integration
- Email service configuration
- SSL certificates and security hardening

## 🎮 Testing Guide

### Role-Based Testing
1. Login as **Admin** → Test user management and system oversight
2. Login as **NGO** → Submit a project and track progress
3. Login as **Auditor** → Review and verify submitted projects
4. Login as **Buyer** → Browse marketplace and purchase credits

### Feature Testing Checklist
- [ ] Authentication and role switching
- [ ] Dashboard customization
- [ ] Project submission workflow
- [ ] Verification process
- [ ] Marketplace functionality
- [ ] Profile management
- [ ] Admin panel operations

## 📞 Support & Development

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Environment Variables
```env
VITE_API_URL=http://localhost:3000/api
VITE_BLOCKCHAIN_NETWORK=testnet
VITE_FILE_UPLOAD_MAX_SIZE=10MB
```

This comprehensive platform provides a complete solution for blue carbon project management, verification, and carbon credit trading with a focus on transparency, efficiency, and environmental impact.