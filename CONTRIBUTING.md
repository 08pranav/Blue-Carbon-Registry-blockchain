# Contributing to Blue Carbon Registry Blockchain

Thank you for your interest in contributing to the Blue Carbon Registry Blockchain project! This guide will help you get started.

## 🌟 Ways to Contribute

### 🐛 Bug Reports
- Found a bug? Open an issue with detailed reproduction steps
- Include screenshots, error messages, and browser/OS info
- Check existing issues to avoid duplicates

### ✨ Feature Requests  
- Suggest new features for blockchain integration
- Propose improvements to user experience
- Share ideas for additional smart contract functionality

### 💻 Code Contributions
- Fix bugs or implement new features
- Improve documentation and comments
- Add tests for existing functionality
- Optimize gas usage in smart contracts

### 📖 Documentation
- Improve setup guides and tutorials
- Add examples and use cases
- Translate documentation to other languages
- Create video tutorials or blog posts

## 🚀 Getting Started

### 1. Fork & Clone
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Blue-Carbon-Registry-blockchain.git
cd Blue-Carbon-Registry-blockchain
```

### 2. Setup Development Environment
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Add your Infura key and other configs

# Start development server
npm run dev
```

### 3. Create Feature Branch
```bash
# Create a new branch for your feature
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

## 📋 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint rules (`npm run lint`)
- Use Prettier for code formatting
- Add JSDoc comments for functions
- Keep functions small and focused

### React Components
```tsx
// Example component structure
interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

export const MyComponent: React.FC<Props> = ({ title, onSubmit }) => {
  // Component logic here
  return (
    <div className="p-4">
      {/* JSX here */}
    </div>
  );
};
```

### Smart Contract Guidelines
- Use OpenZeppelin contracts when possible
- Add comprehensive comments
- Include proper error messages
- Write unit tests for all functions
- Optimize for gas efficiency

```solidity
// Example contract structure
contract MyContract is Ownable, AccessControl {
    /// @dev Detailed function description
    /// @param param1 Description of parameter
    /// @return Description of return value
    function myFunction(uint256 param1) external onlyRole(ADMIN_ROLE) returns (bool) {
        require(param1 > 0, "MyContract: Invalid parameter");
        // Function logic here
        return true;
    }
}
```

## 🧪 Testing

### Frontend Testing
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test
npm run test -- --testNamePattern="ComponentName"
```

### Smart Contract Testing
```bash
cd blockchain-deployment
npm run test
npm run test:coverage
```

### Manual Testing Checklist
- [ ] MetaMask connection works
- [ ] All user roles function correctly
- [ ] Blockchain transactions complete successfully
- [ ] UI updates after transaction confirmation
- [ ] Error handling works properly

## 📦 Pull Request Process

### 1. Before Submitting
- [ ] Code follows style guidelines
- [ ] All tests pass locally
- [ ] Documentation is updated
- [ ] Blockchain integration works on Sepolia
- [ ] No console errors in browser

### 2. PR Description Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Blockchain contract update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Blockchain functionality verified

## Screenshots (if applicable)
Add screenshots of UI changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass locally
```

### 3. Review Process
1. Automated checks must pass (linting, tests, build)
2. Code review by maintainers
3. Testing on Sepolia testnet
4. Final approval and merge

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   └── *.tsx           # Custom components
├── pages/              # Page components (routes)
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── contracts/          # Smart contract artifacts
└── blockchain-integration/ # Blockchain utilities

blockchain-deployment/  # Smart contract development
├── contracts/         # Solidity contracts
├── scripts/          # Deployment scripts
├── test/            # Contract tests
└── artifacts/       # Compiled contracts
```

## 🔐 Security Guidelines

### Frontend Security
- Validate all user inputs
- Sanitize data before display
- Use HTTPS for all external requests
- Implement proper error boundaries

### Blockchain Security
- Follow OpenZeppelin security patterns
- Use access control modifiers
- Implement proper input validation
- Consider reentrancy attacks
- Test edge cases thoroughly

### Environment Variables
- Never commit secrets to git
- Use different keys for development/production
- Rotate API keys regularly
- Document required environment variables

## 🐛 Debugging Tips

### Frontend Issues
```bash
# Check console for errors
# Use React DevTools
# Verify state updates
# Check network requests in DevTools
```

### Blockchain Issues
```bash
# Check MetaMask for transaction details
# Use Sepolia Etherscan to verify transactions
# Verify contract addresses are correct
# Check gas limit and price
```

### Common Issues & Solutions

1. **Transaction Fails**
   - Check gas limit
   - Verify account has sufficient ETH
   - Ensure correct network (Sepolia)

2. **Contract Not Found**
   - Verify contract addresses in addresses.json
   - Check network configuration
   - Redeploy contracts if needed

3. **MetaMask Connection Issues**
   - Clear browser cache
   - Reset MetaMask account
   - Check network settings

## 📚 Resources

### Learning Materials
- [Ethereum Developer Docs](https://ethereum.org/developers)
- [Solidity Documentation](https://soliditylang.org)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### Tools
- [Hardhat](https://hardhat.org) - Ethereum development environment
- [OpenZeppelin](https://openzeppelin.com) - Secure contract library
- [MetaMask](https://metamask.io) - Ethereum wallet
- [Sepolia Faucet](https://sepoliafaucet.com) - Test ETH

### Community
- Join our Discord server (link in repository)
- Follow project updates on Twitter
- Subscribe to our newsletter
- Star the repository to show support

## 🎯 Roadmap

### Short Term (1-2 months)
- [ ] Mobile responsive design
- [ ] Additional blockchain networks
- [ ] Enhanced audit dashboard
- [ ] Batch transaction support

### Medium Term (3-6 months)
- [ ] NFT certificates for credits
- [ ] Oracle integration for environmental data
- [ ] Mobile app (React Native)
- [ ] Multi-language support

### Long Term (6+ months)
- [ ] DAO governance system
- [ ] Cross-chain interoperability
- [ ] AI-powered project verification
- [ ] Satellite imagery integration

## ❓ FAQ

**Q: How do I test blockchain features without spending real money?**
A: Use the Sepolia testnet with free test ETH from faucets.

**Q: Can I contribute without blockchain knowledge?**
A: Yes! We need help with UI/UX, documentation, testing, and more.

**Q: How long does code review take?**
A: Usually 1-3 days, depending on the size and complexity of changes.

**Q: Do I need to sign a CLA?**
A: No, but by contributing, you agree to license your contributions under the project's MIT license.

---

## 🙏 Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes
- Invited to community events
- Eligible for maintainer roles

**Thank you for helping build a more sustainable future! 🌱**