# 🚨 MANUAL FIX FOR MINTING PERMISSIONS

## ❌ **The Issue:**
The contract ABI doesn't match the deployed contract, causing "missing revert data" errors.

## ✅ **Manual Solution:**

### **Step 1: Check Contract on Etherscan**
1. Go to: https://sepolia.etherscan.io/address/0x025614e8Dc0b1eb488604D6f6C85982b85f9665B
2. Click "Contract" tab
3. Check if it shows "Read Contract" and "Write Contract" sections
4. If not verified, we need to verify the contract first

### **Step 2: Verify Contract (if needed)**
```bash
cd blockchain-deployment
npx hardhat verify --network sepolia 0x025614e8Dc0b1eb488604D6f6C85982b85f9665B "Blue Carbon Credits" "BCC" "0x179d59195f5771E907463986bCE98B0369e52837"
```

### **Step 3: Grant Role via Etherscan (Manual)**
1. Go to verified contract on Etherscan
2. Click "Write Contract" 
3. Connect your wallet (admin wallet: `0x179d59195f5771E907463986bCE98B0369e52837`)
4. Find "grantRole" function
5. Use these parameters:
   - **role**: `0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6` (MINTER_ROLE)
   - **account**: `0x4510c03bAb31E60fd99839A6eA3685f83dd3479D` (Marketplace)
6. Click "Write" and confirm transaction

### **Step 4: Verify Fix**
After the transaction confirms:
1. Go to "Read Contract" section
2. Find "hasRole" function
3. Check with:
   - **role**: `0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6`
   - **account**: `0x4510c03bAb31E60fd99839A6eA3685f83dd3479D`
4. Should return `true`

### **Step 5: Test in App**
1. Open: http://localhost:8082/role-login
2. Login as Auditor
3. Connect the admin wallet
4. Try approving a project - should work now!

## 🔍 **Alternative: Redeploy Contracts**
If the manual fix doesn't work, we might need to redeploy with proper setup:

```bash
cd blockchain-deployment
npx hardhat run scripts/deploy.js --network sepolia
# Then update contract addresses in config.ts
```

## 📝 **What's Happening:**
The deployed contract might be a different version than expected, or the ABI compilation is outdated. The manual Etherscan method bypasses ABI issues by using the verified contract interface.

Try the Etherscan manual method first - it's the most reliable! 🔗