# 🌐 Sepolia Testnet Blockchain Setup Guide

## 🎯 Quick Fix for "Gas estimation failed" Error

The contracts are **already deployed** on Sepolia testnet! The issue is permissions.

### 📋 Contract Addresses (Already Deployed)
- **Token Contract**: `0x025614e8Dc0b1eb488604D6f6C85982b85f9665B`
- **Marketplace**: `0x4510c03bAb31E60fd99839A6eA3685f83dd3479D`
- **Chain ID**: 11155111 (Sepolia)

### 🔑 Wallet Addresses
- **NGO**: `0x24cF2631Cd812089e14da2Bb6d7A7C5505258656`
- **COMPANY**: `0x179d59195f5771E907463986bCE98B0369e52837` ← **Contract Owner**
- **AUDITOR**: `0xDBFd5Ac809f47D72C46354D30972523827479964` ← **Needs Permissions**

## ⚡ Quick Solutions

### Option 1: Grant Auditor Permissions (Recommended)
```bash
cd blockchain-deployment
npx hardhat run scripts/grant-auditor-permissions.js --network sepolia
```

### Option 2: Use Company Wallet as Auditor
Change the auditor wallet to the contract owner:
```javascript
// In fixedWallets.js
AUDITOR: '0x179d59195f5771E907463986bCE98B0369e52837'  // Same as COMPANY
```

### Option 3: Use Demo Mode (Current Fallback)
The app automatically falls back to demo mode when blockchain fails.

## 🔧 MetaMask Setup

1. **Add Sepolia Network**:
   - Network Name: Sepolia Test Network
   - RPC URL: `https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID`
   - Chain ID: 11155111
   - Symbol: ETH
   - Explorer: https://sepolia.etherscan.io

2. **Get Sepolia ETH**:
   - https://sepoliafaucet.com/
   - https://www.alchemy.com/faucets/ethereum-sepolia

3. **Import Wallet**:
   Import the private key for the COMPANY wallet (contract owner)

## 🧪 Test Connection
```bash
cd blockchain-deployment
npx hardhat run scripts/test-sepolia-connection.js --network sepolia
```

## ✅ Expected Result
After fixing permissions, you should see:
- Real blockchain transactions instead of demo mode
- Actual token minting to NGO wallets
- Transaction hashes on Sepolia Etherscan

## 💡 Current Status
- ✅ Contracts deployed and verified
- ✅ Frontend configured for Sepolia  
- ❌ Auditor needs minting permissions
- ✅ Automatic fallback to demo mode working

The blockchain IS working - it just needs permission setup! 🚀