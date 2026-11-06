# Blockchain deployment (Sepolia)

Prereqs
- Node 18+, npm
- Hardhat in new-bluecarbon/contracts
- Accounts: a funded Sepolia account

Env (.env at new-bluecarbon/)
PRIVATE_KEY=0x<private_key>
SEPOLIA_URL=https://sepolia.infura.io/v3/${INFURA_API_KEY}
ETHERSCAN_API_KEY=<etherscan_key>

Install & compile
cd new-bluecarbon/contracts
npm ci
npx hardhat compile

Deploy
npm run deploy:sepolia

Artifacts
- Addresses: new-bluecarbon/contracts/deployments/sepolia.json
- ABIs: new-bluecarbon/contracts/artifacts/**/BlueCarbon*.json

Wire to frontend
- Copy addresses to blue-carbon-new-frontend/src/contracts/addresses.json
- Copy ABIs as needed to blue-carbon-new-frontend/src/contracts/abi/
- Ensure VITE_RPC_URL points at a Sepolia RPC

Verify (optional)
npm run verify:sepolia

