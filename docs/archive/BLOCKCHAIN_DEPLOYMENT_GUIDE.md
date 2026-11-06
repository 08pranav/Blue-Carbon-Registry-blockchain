# 🚀 Blockchain Deployment Guide

This guide will help you deploy the Blue Carbon smart contracts to Sepolia testnet and integrate them with the frontend.

## 📋 Prerequisites

1. **MetaMask Wallet**
   - Install MetaMask browser extension
   - Create or import a wallet
   - Switch to Sepolia testnet
   - Get Sepolia ETH from faucet: https://sepoliafaucet.com/

2. **Node.js & npm**
   - Node.js 18+ required
   - Verify: `node --version` and `npm --version`

## 🔧 Step 1: Setup Deployment Environment

Navigate to the blockchain deployment directory:
```bash
cd blockchain-deployment
```

Install dependencies:
```bash
npm install
```

## 🔐 Step 2: Configure Environment

Copy the environment template:
```bash
cp .env.example .env
```

Edit `.env` file and add your information:
```env
# Your Sepolia private key (without 0x prefix)
SEPOLIA_PRIVATE_KEY=your_sepolia_private_key_here

# Sepolia RPC URL (using public endpoint)  
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Etherscan API key for contract verification (optional)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**⚠️ IMPORTANT SECURITY NOTES:**
- Never commit your private key to git
- Use a dedicated wallet for testing (not your main wallet)
- The `.env` file is already in `.gitignore`

## 🏗️ Step 3: Deploy Smart Contracts

Compile the contracts:
```bash
npm run compile
```

Deploy to Sepolia testnet:
```bash
npm run deploy:sepolia
```

The deployment script will:
1. Deploy CarbonCreditToken (BCC) contract
2. Deploy Marketplace contract  
3. Grant MINTER_ROLE to marketplace
4. Save deployment addresses to `deployments/sepolia.json`
5. Update frontend configuration automatically

## ✅ Step 4: Verify Deployment

After successful deployment, you should see output like:
```
🎉 Deployment Complete!
========================
📋 Contract Addresses:
   CarbonCreditToken: 0x1234567890abcdef...
   Marketplace: 0xfedcba0987654321...

🌐 View on Etherscan:
   Token: https://sepolia.etherscan.io/address/0x1234...
   Marketplace: https://sepolia.etherscan.io/address/0xfedcba...
```

## 🔍 Step 5: Verify Contracts on Etherscan (Optional)

Verify the token contract:
```bash
npx hardhat verify --network sepolia <TOKEN_ADDRESS> "BlueCarbonCredit" "BCC" "<YOUR_WALLET_ADDRESS>"
```

Verify the marketplace contract:
```bash  
npx hardhat verify --network sepolia <MARKETPLACE_ADDRESS> <TOKEN_ADDRESS>
```

## 🌐 Step 6: Test Frontend Integration

1. Start the frontend development server:
   ```bash
   cd ..
   npm run dev
   ```

2. Open http://localhost:8080 in your browser

3. Navigate to the "Blockchain" page

4. Connect your MetaMask wallet (make sure you're on Sepolia)

5. Test the functionality:
   - Check wallet connection
   - View contract addresses
   - Register an NGO
   - Test other blockchain operations

## 🧪 Step 7: Testing Operations

### Register an NGO
1. Go to Blockchain page → Register tab
2. Fill in NGO name and documents hash (use a test IPFS hash)
3. Click "Register NGO"
4. Confirm MetaMask transaction
5. Wait for confirmation

### Verify NGO (Admin Only)
1. Switch to Verify tab
2. Enter the NGO ID (usually starts from 1)
3. Enter credits to allocate (e.g., 1000)
4. Click "Approve"
5. Confirm transaction

### Execute Trade
1. Go to Trade tab
2. Enter seller address (use the NGO wallet address)
3. Enter amount of credits and price in ETH
4. Click "Execute Trade"
5. Confirm transaction (you'll pay the price + gas fees)

## 📁 Generated Files

After deployment, these files are created/updated:

- `blockchain-deployment/deployments/sepolia.json` - Deployment information
- `src/blockchain-integration/config.ts` - Updated with contract addresses
- Frontend automatically connects to the deployed contracts

## 🔧 Troubleshooting

### Common Issues:

1. **"Insufficient funds for gas"**
   - Get more Sepolia ETH from faucet
   - Check your wallet balance

2. **"Network not found"**
   - Make sure MetaMask is on Sepolia testnet
   - Check RPC URL in .env file

3. **"Contract not deployed"**
   - Verify deployment was successful
   - Check contract addresses in config.ts

4. **"Transaction failed"**
   - Check gas limit and price
   - Verify you have enough ETH for gas

### Reset and Redeploy:

If you need to redeploy:
```bash
npm run compile
npm run deploy:sepolia
```

This will deploy new contract instances with new addresses.

## 🎯 Next Steps

After successful deployment:

1. **Test all functions** - Register NGOs, companies, execute trades
2. **Monitor transactions** - Use Etherscan to track all operations
3. **Add more features** - Extend contracts with additional functionality
4. **Deploy to mainnet** - When ready for production (requires real ETH)

## 🔗 Useful Links

- **Sepolia Etherscan**: https://sepolia.etherscan.io
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **MetaMask**: https://metamask.io
- **Hardhat Docs**: https://hardhat.org/docs

---

**🎉 Congratulations!** Your Blue Carbon smart contracts are now deployed on Sepolia and integrated with the frontend!