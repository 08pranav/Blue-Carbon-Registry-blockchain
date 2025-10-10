# 🎭 Blue Carbon Credit System - Demo Mode Guide

## Current Status: Demo Mode Active

The Blue Carbon Credit System is currently running in **demo mode** due to smart contract permission issues that are being resolved. This allows you to test the complete workflow without blockchain transactions.

## 🌊 What This System Does

This is a blockchain-based carbon credit trading platform for blue carbon projects (coastal/marine carbon sequestration) with role-based access:

- **NGOs**: Register projects and receive carbon credits
- **Auditors**: Verify and approve NGO projects, mint carbon credits
- **Companies**: Purchase verified carbon credits for offsetting

## 🎯 Demo Accounts Available

### NGO Account
- **Email**: `ngo@bluecarbon.org`
- **Password**: `ngo123`
- **Role**: Can submit projects and receive credits

### Auditor Account  
- **Email**: `auditor@bluecarbon.org`
- **Password**: `auditor123`
- **Role**: Can verify projects and mint credits

### Company Account
- **Email**: `company@bluecarbon.org` 
- **Password**: `company123`
- **Role**: Can purchase carbon credits

## 📋 Complete Demo Workflow

### Step 1: NGO Registration & Project Submission
1. Login as NGO (`ngo@bluecarbon.org` / `ngo123`)
2. Navigate to "Register on Blockchain" tab
3. Click "Register NGO on Blockchain" - this simulates blockchain registration
4. Go to "Submit Project" tab
5. Fill project details (Mumbai locations recommended for authenticity)
6. Submit project for auditor review

### Step 2: Auditor Review & Credit Minting
1. Login as Auditor (`auditor@bluecarbon.org` / `auditor123`)
2. See demo mode banner explaining simulation
3. Click "Fix Permissions" button to simulate permission setup
4. Go to "Project Review" tab
5. Select submitted NGO project
6. Enter allocated credits (e.g., 100-500 credits)
7. Add audit notes
8. Click "Approve Project" - this simulates minting carbon credits

### Step 3: Company Credit Purchase
1. Login as Company (`company@bluecarbon.org` / `company123`)
2. See available credits in marketplace (from approved NGO projects)
3. View pricing in Indian Rupees (₹)
4. Click "Purchase Credits" on desired offer
5. Confirm purchase - simulates blockchain payment transaction

## 🔧 Technical Features Being Demonstrated

### Blockchain Integration (Simulated)
- Smart contract interactions for NGO registration
- Carbon credit token minting with ERC-20 compliance
- Marketplace trading with ETH payments
- All transactions show mock transaction hashes

### Indian Localization
- Currency displayed in Indian Rupees (₹)
- Mumbai-based project locations
- Indian organization names and contexts

### Role-Based Security
- JWT authentication with role verification
- Route protection based on user roles
- Separate dashboards for each user type

### Real-time Updates
- LocalStorage simulation of blockchain state
- Cross-dashboard data synchronization
- Project status tracking through workflow

## 🚀 Switching to Real Blockchain

Once smart contract permissions are fixed:

1. Set `DEMO_MODE = false` in `src/utils/DemoBlockchainService.js`
2. Ensure MetaMask is connected to Sepolia testnet
3. Contract addresses are already configured:
   - Token: `0x025614e8Dc0b1eb488604D6f6C85982b85f9665B`
   - Marketplace: `0x4510c03bAb31E60fd99839A6eA3685f83dd3479D`

## 💡 Demo Mode Benefits

- **Complete UI Testing**: Full user workflow without blockchain complexity
- **Data Persistence**: LocalStorage maintains demo data between sessions  
- **Performance**: Instant "transactions" for smooth demonstrations
- **Accessibility**: No MetaMask or testnet ETH required
- **Educational**: Shows blockchain concepts without technical barriers

## 🎨 UI Highlights

- **Modern Design**: Clean, professional interface with shadcn/ui components
- **Responsive Layout**: Works on desktop and mobile devices
- **Indian Theme**: Rupee symbols, Mumbai projects, local context
- **Status Indicators**: Clear project status tracking and blockchain connection status
- **Demo Banners**: Clear indication when in simulation mode

## 🔄 Data Flow in Demo Mode

```
NGO Dashboard → Project Submission → LocalStorage
    ↓
Auditor Dashboard → Project Approval → Credit Minting Simulation
    ↓  
Company Dashboard → Credit Purchase → Transaction Simulation
    ↓
Updated Balances & Marketplace → UI Refresh
```

## ⚠️ Important Notes

1. **Demo Data**: All transactions are simulated and stored in browser LocalStorage
2. **Mock Hashes**: Transaction hashes are randomly generated for demonstration
3. **No Real Costs**: No ETH or gas fees required in demo mode
4. **Reset Data**: Clear browser data to reset demo state
5. **Production Ready**: Real blockchain integration is implemented and ready to activate

This demo showcases a complete blockchain-based carbon credit trading system with Indian market focus, ready for production deployment once smart contract permissions are resolved.