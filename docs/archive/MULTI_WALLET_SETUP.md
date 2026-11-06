# 👥 Multi-Wallet Setup Guide for Blue Carbon Trading

## 🎯 **You Need 3 MetaMask Accounts:**

### **1. Admin Account (Your Current)**
- **Address**: 0x179d59195f5771E907463986bCE98B0369e52837
- **Role**: Verify NGO projects and mint BCC tokens
- **Has**: 0.21+ ETH on Sepolia

### **2. NGO Account (Create New)**
- **Role**: Receive BCC tokens, list for sale
- **Needs**: Small amount of ETH for gas fees (0.01 ETH)

### **3. Company Account (Create New)**
- **Role**: Buy BCC tokens from NGOs
- **Needs**: ETH to purchase credits (0.1+ ETH)

## 🔧 **How to Create Additional Accounts:**

### **Step 1: Create NGO Account**
1. Open MetaMask
2. Click your account icon (top right)
3. Click "Add account or hardware wallet"
4. Click "Add a new account"
5. Name it "NGO Test Account"
6. **Copy the new address**

### **Step 2: Create Company Account**
1. Repeat the same process
2. Name it "Company Test Account"
3. **Copy this address too**

### **Step 3: Fund the New Accounts**
You'll need to send ETH from your main account to the new ones:

**Send ETH to NGO account:**
```
From: 0x179d59195f5771E907463986bCE98B0369e52837
To: [NGO_ADDRESS]
Amount: 0.02 ETH
```

**Send ETH to Company account:**
```
From: 0x179d59195f5771E907463986bCE98B0369e52837
To: [COMPANY_ADDRESS] 
Amount: 0.1 ETH
```

## 📝 **Record Your Addresses:**

Once you create them, fill this out:

```
ADMIN_ADDRESS=0x179d59195f5771E907463986bCE98B0369e52837
NGO_ADDRESS=[PASTE_NGO_ADDRESS_HERE]
COMPANY_ADDRESS=[PASTE_COMPANY_ADDRESS_HERE]
```

## 🎯 **Testing Flow:**

1. **Admin (You)**: Verify NGO project → Mint 1000 BCC to NGO
2. **Switch to NGO account**: See 1000 BCC balance
3. **NGO**: List 500 BCC for sale at 0.001 ETH each
4. **Switch to Company account**: Buy 100 BCC for 0.1 ETH
5. **Check Etherscan**: See all transactions publicly

---

**👆 Create the accounts first, then I'll show you the enhanced smart contract interactions!**