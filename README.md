# 🌊 Blue Carbon Registry Blockchain

A decentralized platform for carbon credit trading using blockchain technology, specifically designed for blue carbon ecosystems like mangroves, seagrass beds, and salt marshes.

## 🎯 Overview

The Blue Carbon Registry Blockchain is a comprehensive solution that enables NGOs to register mangrove restoration projects, get them verified by certified auditors, and trade carbon credits on a transparent marketplace. Built on Ethereum blockchain with a modern React frontend.

## 🏗️ Architecture

### Blockchain Layer
- **Smart Contracts**: Deployed on Ethereum Sepolia testnet
- **Token Standard**: ERC-20 compliant carbon credit tokens
- **Wallet Integration**: MetaMask integration via Wagmi

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: React Context + TanStack Query
- **Blockchain Integration**: Wagmi + Viem

## 🚀 Features

### For NGOs
- 📝 **Project Registration**: Submit mangrove restoration projects with detailed information
- 🔐 **Blockchain Registration**: Register organization on-chain with MetaMask wallet
- 💰 **Credit Minting**: Receive carbon credit tokens after project verification
- 🛒 **Marketplace Listing**: List credits for sale at custom prices

### For Auditors
- 🔍 **Project Review**: Verify submitted projects with comprehensive data
- ✅ **Approval System**: Approve/reject projects with on-chain transactions
- 📊 **Audit Dashboard**: Track all verification activities and history

### For Companies
- 🛍️ **Credit Purchase**: Buy carbon credits directly with cryptocurrency
- 📈 **Portfolio Tracking**: Monitor purchased credits and transaction history
- 🌿 **Impact Visualization**: See environmental impact of purchased credits

## 🔗 Blockchain Implementation

### Smart Contracts

#### 1. BlueCarbonCredits (ERC-20 Token)
```solidity
// Manages carbon credit tokens
- mint(address to, uint256 amount): Create new tokens for verified projects
- transfer(address to, uint256 amount): Transfer tokens between users
- balanceOf(address): Check token balance
```

#### 2. BlueCarbonRegistry (Main Contract)
```solidity
// Handles registrations and verifications
- registerNGO(string name, string ipfsHash): Register NGO on blockchain
- submitProject(string projectData): Submit project for verification
- verifyProject(uint256 projectId, bool approved, uint256 credits): Auditor verification
- executeTrade(address buyer, uint256 amount, uint256 price): Handle marketplace trades
```

### Transaction Flow

1. **NGO Registration**: NGO connects wallet → Registers on blockchain → Pays gas fees
2. **Project Submission**: NGO submits project details → Stored on-chain with IPFS metadata
3. **Auditor Verification**: Auditor reviews project → Approves/rejects → Triggers token minting
4. **Marketplace Trading**: Companies browse credits → Purchase with ETH → Tokens transferred automatically

## 🛠️ Technical Stack

### Frontend Dependencies
```json
{
  "react": "^18.3.1",
  "typescript": "^5.8.3",
  "vite": "^5.4.19",
  "wagmi": "^2.12.17",
  "viem": "^2.21.0",
  "@tanstack/react-query": "^5.83.0",
  "@radix-ui/react-*": "Latest",
  "tailwindcss": "^3.4.17"
}
```

### Blockchain Technology
- **Network**: Ethereum Sepolia Testnet
- **Wallet**: MetaMask integration
- **Gas Optimization**: Batched transactions for efficiency
- **Token Standard**: ERC-20 for interoperability

## 📁 Project Structure

```
blue-carbon-new-frontend/
├── src/
│   ├── components/           # React components
│   │   ├── ConnectWalletButton.tsx
│   │   ├── SubmitProjectWizard.tsx
│   │   └── BlockchainTransactions.tsx
│   ├── pages/               # Route components
│   │   ├── NGODashboard.tsx
│   │   ├── AuditorDashboard.tsx
│   │   ├── CompanyDashboard.tsx
│   │   └── Marketplace.tsx
│   ├── contexts/            # React contexts
│   │   ├── BlockchainContext.tsx
│   │   └── RoleAuthContext.tsx
│   ├── contracts/           # Smart contract artifacts
│   │   └── addresses.json
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Utility functions
├── blockchain-deployment/   # Deployment scripts
├── docs/                   # Documentation files
│   ├── BLOCKCHAIN_DEPLOY.md
│   ├── BLOCKCHAIN_EXPLANATION.md
│   └── DEPLOYMENT_GUIDE.md
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask wallet
- Sepolia ETH (for testnet)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/Blue-Carbon-Registry-blockchain.git
cd Blue-Carbon-Registry-blockchain
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
```

4. **Configure Environment Variables**
```env
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
VITE_CHAIN_ID=11155111
```

5. **Start Development Server**
```bash
npm run dev
```

### Blockchain Setup

1. **Get Sepolia ETH**
   - Use [Sepolia Faucet](https://sepoliafaucet.com/) to get test ETH
   - Add Sepolia network to MetaMask

2. **Connect Wallet**
   - Install MetaMask extension
   - Import your wallet or create new one
   - Switch to Sepolia testnet

## 📖 User Guide

### For NGOs
1. Connect MetaMask wallet
2. Click "Register on Blockchain" and confirm transaction
3. Submit project with details (location, expected credits, timeline)
4. Wait for auditor verification
5. Once approved, list credits on marketplace

### For Auditors
1. Connect wallet and access auditor dashboard
2. Review submitted projects with all documentation
3. Verify project authenticity and environmental impact
4. Approve/reject with blockchain transaction

### For Companies
1. Browse marketplace for available credits
2. Review project details and verification status
3. Purchase credits with ETH payment
4. Track portfolio in company dashboard

## 🔧 Development

### Running Tests
```bash
npm run test
npm run test:coverage
```

### Building for Production
```bash
npm run build
```

### Linting and Type Checking
```bash
npm run lint
npm run typecheck
```

## 📊 Smart Contract Addresses (Sepolia)

| Contract | Address | Purpose |
|----------|---------|---------|
| BlueCarbonCredits | `0x025614e8Dc0b1eb488604D6f6C85982b85f9665B` | ERC-20 token for carbon credits |
| BlueCarbonRegistry | `0x4510c03bAb31E60fd99839A6eA3685f83dd3479D` | Main registry and marketplace |

## 🌍 Environmental Impact

This platform facilitates:
- **Transparent Carbon Trading**: All transactions recorded on blockchain
- **Verified Environmental Projects**: Auditor-verified mangrove restoration
- **Real Impact Tracking**: Direct connection between credits and restoration projects
- **Global Accessibility**: Decentralized platform available worldwide

## 🔐 Security Features

- **Wallet-based Authentication**: No passwords, only cryptographic signatures
- **On-chain Verification**: All critical actions verified on blockchain
- **Role-based Access**: Separate interfaces for NGOs, auditors, and companies
- **Immutable Records**: All transactions permanently recorded on blockchain

## 📈 Future Roadmap

- [ ] **Multi-chain Support**: Deploy on Polygon and other networks
- [ ] **NFT Certificates**: Issue NFT certificates for large credit purchases
- [ ] **Mobile App**: React Native mobile application
- [ ] **Oracle Integration**: Real-time environmental data from satellites
- [ ] **DAO Governance**: Community-driven auditor selection

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ethereum Foundation** for blockchain infrastructure
- **MetaMask** for wallet integration
- **Wagmi** for React blockchain hooks
- **Vercel** for deployment platform
- **shadcn/ui** for beautiful UI components

## 📞 Support

For questions and support:
- Create an issue in this repository
- Check existing documentation in the `/docs` folder
- Review blockchain deployment guides

---

**Built with ❤️ for a sustainable future 🌱**

*This project was developed to demonstrate blockchain technology in environmental sustainability and carbon credit trading.*


