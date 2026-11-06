// Blockchain Configuration for Blue Carbon Registry

// Network Configurations
export const NETWORKS = {
  SEPOLIA: {
    chainId: 11155111,
    chainIdHex: "0xaa36a7",
    chainName: "Sepolia Testnet",
    rpcUrls: [
      "https://ethereum-sepolia-rpc.publicnode.com",
      "https://rpc.sepolia.org",
      "https://rpc2.sepolia.org"
    ],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
    nativeCurrency: {
      name: "SepoliaETH",
      symbol: "ETH",
      decimals: 18
    }
  },
  LOCAL: {
    // Hardhat node (`npx hardhat node`) default chain id
    chainId: 31337,
    chainIdHex: "0x7a69",
    chainName: "Hardhat Local",
    rpcUrls: ["http://127.0.0.1:8545"],
    blockExplorerUrls: [],
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18
    }
  }
};

// Contract Addresses
export const CONTRACT_ADDRESSES = {
  SEPOLIA: {
    CARBON_CREDIT_TOKEN: "0x025614e8Dc0b1eb488604D6f6C85982b85f9665B",
    MARKETPLACE: "0x4510c03bAb31E60fd99839A6eA3685f83dd3479D"
  },
  // Filled in by `npm run deploy:local` (it writes .env.local). Defaults are the addresses a
  // fresh `npx hardhat node` produces for the first two deployments from account #0.
  LOCAL: {
    CARBON_CREDIT_TOKEN: import.meta.env.VITE_LOCAL_TOKEN_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    MARKETPLACE: import.meta.env.VITE_LOCAL_MARKETPLACE_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
  }
};

// Current network: Sepolia unless VITE_NETWORK=LOCAL (see .env.example)
export const CURRENT_NETWORK: "SEPOLIA" | "LOCAL" = import.meta.env.VITE_NETWORK === "LOCAL" ? "LOCAL" : "SEPOLIA";

// Contract ABIs (minimal for basic functionality)
export const CARBON_CREDIT_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mint(address to, uint256 amount)",
  "function burn(uint256 amount)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function owner() view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
];

export const MARKETPLACE_ABI = [
  "function registerNGO(address wallet, string name, string documentsHash) returns (uint256)",
  "function registerCompany(address wallet, string name, string kycHash) returns (uint256)",
  "function verifyNGO(uint256 ngoId, uint8 status, uint256 creditsToAllocate)",
  "function executeTrade(address seller, address buyer, uint256 amount, string pdfHash) payable returns (uint256)",
  "function getNgoById(uint256 id) view returns (tuple(uint256 ngoId, address wallet, string name, uint8 status, string documentsHash, uint256 creditsAllocated, uint256 dateVerified))",
  "function getCompanyById(uint256 id) view returns (tuple(uint256 companyId, address wallet, string name, string kycHash))",
  "function getTradeById(uint256 id) view returns (tuple(uint256 tradeId, address seller, address buyer, uint256 amount, uint256 price, string pdfHash, uint256 timestamp))",
  "function admin() view returns (address)",
  "function setAdmin(address newAdmin)",
  "function ngoIdByWallet(address wallet) view returns (uint256)",
  "function token() view returns (address)",
  "function nextNgoId() view returns (uint256)",
  "function nextCompanyId() view returns (uint256)",
  "function nextTradeId() view returns (uint256)",
  "event NGORegistered(uint256 indexed ngoId, address indexed wallet, string name)",
  "event NGOStatusUpdated(uint256 indexed ngoId, uint8 status, uint256 timestamp)",
  "event CreditsMinted(uint256 indexed ngoId, address indexed to, uint256 amount)",
  "event CompanyRegistered(uint256 indexed companyId, address indexed wallet, string name)",
  "event TradeExecuted(uint256 indexed tradeId, address indexed seller, address indexed buyer, uint256 amount, uint256 price, string pdfHash)"
];

// Main configuration object for web3Helper
export const BLOCKCHAIN_CONFIG = {
  TOKEN_ADDRESS: CONTRACT_ADDRESSES[CURRENT_NETWORK as keyof typeof CONTRACT_ADDRESSES].CARBON_CREDIT_TOKEN,
  MARKETPLACE_ADDRESS: CONTRACT_ADDRESSES[CURRENT_NETWORK as keyof typeof CONTRACT_ADDRESSES].MARKETPLACE,
  TOKEN_ABI: CARBON_CREDIT_TOKEN_ABI,
  MARKETPLACE_ABI: MARKETPLACE_ABI,
  NETWORK_CONFIG: NETWORKS[CURRENT_NETWORK as keyof typeof NETWORKS]
};

// Helper functions
export const getCurrentNetworkConfig = () => {
  return NETWORKS[CURRENT_NETWORK as keyof typeof NETWORKS];
};

export const getCurrentContractAddresses = () => {
  return CONTRACT_ADDRESSES[CURRENT_NETWORK as keyof typeof CONTRACT_ADDRESSES];
};