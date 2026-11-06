# 🔧 Blockchain Setup Guide for Beginners

This guide will help you understand and set up the blockchain components of the Blue Carbon Registry.

## 🎯 What is Blockchain in This Project?

Think of blockchain as a **digital ledger** that records transactions permanently and transparently. In our Blue Carbon Registry:

- **NGOs** register their mangrove projects on the blockchain
- **Auditors** verify projects and mint carbon credit tokens
- **Companies** buy these tokens to offset their carbon footprint
- All transactions are **permanent** and **transparent**

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart          │    │   Ethereum      │
│   (React App)   │◄──►│   Contracts      │◄──►│   Blockchain    │
│                 │    │   (Solidity)     │    │   (Sepolia)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

### 1. Install MetaMask
- Go to [metamask.io](https://metamask.io)
- Install the browser extension
- Create a new wallet (save your seed phrase safely!)

### 2. Get Sepolia Test ETH
- Add Sepolia network to MetaMask:
  - Network Name: `Sepolia`
  - RPC URL: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
  - Chain ID: `11155111`
  - Currency: `ETH`
- Get free test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

### 3. Node.js Development Environment
```bash
# Check if you have Node.js
node --version  # Should be 18+

# If not installed, download from nodejs.org
```

## 🚀 Running the Project

### 1. Clone and Setup
```bash
git clone https://github.com/08pranav/Blue-Carbon-Registry-blockchain.git
cd Blue-Carbon-Registry-blockchain
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` file:
```env
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
VITE_CHAIN_ID=11155111
```

### 3. Start Development
```bash
npm run dev
```

## 🔗 Smart Contracts Explained

### 1. CarbonCreditToken.sol
This creates the actual **carbon credit tokens** (like digital coins):
```solidity
// Mint tokens for verified projects
function mint(address ngo, uint256 amount) public onlyAuditor {
    _mint(ngo, amount);  // Create tokens for NGO
}
```

### 2. Marketplace.sol
This handles **registrations** and **trading**:
```solidity
// Register an NGO on blockchain
function registerNGO(string memory name, string memory data) public {
    ngos[msg.sender] = NGO(name, data, true);
}

// Verify project and mint tokens
function verifyProject(address ngo, uint256 credits) public onlyAuditor {
    carbonToken.mint(ngo, credits);  // Give tokens to NGO
}
```

## 🔄 Transaction Flow (Step by Step)

### Step 1: NGO Registration
```javascript
// In the React app, when NGO clicks "Register"
const tx = await marketplace.registerNGO("Green Earth NGO", "ipfs://project-data");
await tx.wait();  // Wait for blockchain confirmation
```

### Step 2: Project Submission
```javascript
// NGO submits project for verification
const submitTx = await marketplace.submitProject({
  name: "Mangrove Restoration Mumbai",
  location: "Mumbai Coast",
  expectedCredits: 1000
});
```

### Step 3: Auditor Verification
```javascript
// Auditor approves and mints tokens
const verifyTx = await marketplace.verifyProject(ngoAddress, 1000);
await verifyTx.wait();  // 1000 tokens created for NGO
```

### Step 4: Marketplace Trading
```javascript
// Company buys tokens
const buyTx = await marketplace.buyCredits(ngoAddress, 500, {
  value: ethers.utils.parseEther("0.1")  // Pay 0.1 ETH
});
```

## 🎮 Testing the Blockchain Features

### 1. Connect Wallet
- Open the app
- Click "Connect Wallet"
- MetaMask will popup - approve connection

### 2. Switch Roles
The app has three main user types:
- **NGO**: Register projects, list credits
- **Auditor**: Verify projects, mint tokens  
- **Company**: Buy credits

### 3. Watch Transactions
Every blockchain action will:
- Show a MetaMask popup for confirmation
- Display transaction hash when confirmed
- Update balances automatically

## 🔍 Debugging Blockchain Issues

### Common Problems:

1. **"Transaction Failed"**
   - Check you have enough Sepolia ETH
   - Ensure you're on Sepolia network

2. **"Contract Not Found"**
   - Verify contract addresses in `src/contracts/addresses.json`
   - Check network is Sepolia (Chain ID: 11155111)

3. **"Insufficient Funds"**
   - Get more test ETH from faucet
   - Each transaction costs ~$0.01 in test ETH

### Useful Tools:
- **Sepolia Etherscan**: Check transactions at [sepolia.etherscan.io](https://sepolia.etherscan.io)
- **MetaMask**: View transaction history and token balances
- **Browser Console**: Check for JavaScript errors

## 📊 Understanding Gas and Transactions

### What is Gas?
Gas is the fee paid to process transactions on Ethereum:
- **Registration**: ~0.001 ETH (~$2)
- **Token Minting**: ~0.002 ETH (~$4)  
- **Token Transfer**: ~0.0005 ETH (~$1)

### Transaction States:
1. **Pending**: Submitted to blockchain, waiting confirmation
2. **Confirmed**: Successfully processed and permanent
3. **Failed**: Rejected (usually insufficient gas or funds)

## 🛠️ Advanced: Deploy Your Own Contracts

If you want to deploy fresh contracts:

```bash
cd blockchain-deployment
npm install
npx hardhat compile
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

This will:
1. Deploy new smart contracts
2. Return new contract addresses
3. Update `src/contracts/addresses.json`

## 📚 Learning Resources

### Ethereum Basics:
- [Ethereum.org](https://ethereum.org/developers) - Official docs
- [Solidity Tutorial](https://soliditylang.org/docs) - Smart contract language
- [OpenZeppelin](https://openzeppelin.com/contracts) - Security standards

### React + Web3:
- [Wagmi Docs](https://wagmi.sh) - React hooks for Ethereum
- [Viem](https://viem.sh) - TypeScript Ethereum library
- [MetaMask Docs](https://docs.metamask.io) - Wallet integration

### Testing Networks:
- **Sepolia**: Main Ethereum testnet
- **Goerli**: Alternative testnet  
- **Ganache**: Local blockchain for development

## ❓ FAQ

**Q: Is this real money?**
A: No! Sepolia uses test ETH with no real value. Perfect for learning.

**Q: Can I deploy to mainnet?**
A: Yes, but you'll need real ETH for gas fees (~$50+ per deployment).

**Q: How secure are smart contracts?**
A: Our contracts use OpenZeppelin standards and follow security best practices.

**Q: What happens if I lose my private key?**
A: Your wallet and tokens become inaccessible forever. Always backup your seed phrase!

---

**Happy Learning! 🚀**

*This guide covers the basics. Experiment with different features and check the blockchain explorers to see your transactions.*