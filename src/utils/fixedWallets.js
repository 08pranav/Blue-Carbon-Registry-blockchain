// Wallet address each demo role must use in MetaMask.
//
// Override per role with VITE_NGO_WALLET / VITE_AUDITOR_WALLET / VITE_COMPANY_WALLET
// (see .env.example). The defaults are the wallets used on the live Sepolia deployment.
//
// AUDITOR must be the Marketplace admin (the deployer), because only the admin can call
// Marketplace.verifyNGO(), which is how BCC is minted. On the live deployment the admin is
// 0x179d..., which is also the default COMPANY wallet; set VITE_COMPANY_WALLET to give the
// Company its own account.
const DEFAULTS = {
  NGO: '0x24cF2631Cd812089e14da2Bb6d7A7C5505258656',
  COMPANY: '0x179d59195f5771E907463986bCE98B0369e52837',
  AUDITOR: '0x179d59195f5771E907463986bCE98B0369e52837',
};

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

// Use the env value if it is a valid address; otherwise warn and fall back to the default.
function fromEnv(name, fallback) {
  const value = import.meta.env[name]?.trim();
  if (!value) return fallback;
  if (!ADDRESS_RE.test(value)) {
    console.warn(`${name} is not a valid Ethereum address (${value}); using the default wallet instead.`);
    return fallback;
  }
  return value;
}

export const FIXED_WALLETS = {
  NGO: fromEnv('VITE_NGO_WALLET', DEFAULTS.NGO),
  COMPANY: fromEnv('VITE_COMPANY_WALLET', DEFAULTS.COMPANY),
  AUDITOR: fromEnv('VITE_AUDITOR_WALLET', DEFAULTS.AUDITOR),
};

// Get wallet address by role
export const getWalletByRole = (role) => {
  return FIXED_WALLETS[role.toUpperCase()];
};

// Get role by wallet address (first match wins when roles share an address)
export const getRoleByWallet = (address) => {
  const lower = address.toLowerCase();
  for (const [role, wallet] of Object.entries(FIXED_WALLETS)) {
    if (wallet.toLowerCase() === lower) {
      return role;
    }
  }
  return null;
};

// Validate if connected wallet matches user role
export const validateWalletForRole = (connectedAddress, userRole) => {
  const expectedAddress = getWalletByRole(userRole);
  return connectedAddress.toLowerCase() === expectedAddress.toLowerCase();
};
