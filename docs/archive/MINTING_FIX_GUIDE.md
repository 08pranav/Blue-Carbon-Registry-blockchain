# 🔧 FIXING THE "only admin" ERROR - STEP BY STEP

## ❌ **The Problem:**
```
Blockchain approval failed: execution reverted: "only admin"
```

**What's happening:** 
- The marketplace contract is trying to mint carbon credit tokens
- But it doesn't have permission to do so
- Only wallets with "MINTER_ROLE" can mint tokens

## ✅ **The Solution:**

### **Step 1: Use the Admin Wallet**
- The wallet that deployed the contracts has admin privileges
- This is the wallet that can grant permissions to other contracts

### **Step 2: Open Auditor Dashboard**
1. Go to `http://localhost:8083/role-login`
2. Login as Auditor: `auditor@mahabluecarbon.gov.in`
3. **IMPORTANT:** Connect the same MetaMask wallet that deployed the contracts

### **Step 3: Fix Permissions**
1. You'll see an orange warning: "⚠️ Blockchain Setup Required"
2. Click the "Fix Permissions" button
3. Confirm the transaction in MetaMask
4. Wait for confirmation

### **Step 4: Test Token Minting**
1. After permissions are fixed, the card turns green: "🔗 Auditor Wallet Connected & Ready!"
2. Now try approving a project with carbon credits
3. It should work and mint real blockchain tokens!

## 🔍 **What the Fix Does:**
```javascript
// Grants MINTER_ROLE to marketplace contract
await tokenContract.grantRole(MINTER_ROLE, marketplaceAddress);

// Now marketplace can mint tokens:
await marketplaceContract.verifyNGO(ngoId, approved, credits);
// → This calls token.mint() successfully ✅
```

## 🎯 **Expected Results:**
- ✅ No more "only admin" errors  
- ✅ Projects can be approved and credits minted
- ✅ Real blockchain transactions with gas fees
- ✅ Carbon credit tokens appear in NGO wallets

## 🚨 **Important Notes:**
- This is a **one-time setup** per deployment
- Only the admin wallet (contract deployer) can grant permissions
- After setup, any auditor can approve projects
- The permission is permanent on the blockchain

Try it now and let me know if the minting works! 🌊