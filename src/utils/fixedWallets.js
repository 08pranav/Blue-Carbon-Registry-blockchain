// Fixed wallet addresses for different roles
export const FIXED_WALLETS = {
  NGO: '0x24cF2631Cd812089e14da2Bb6d7A7C5505258656',
  COMPANY: '0x179d59195f5771E907463986bCE98B0369e52837', 
  AUDITOR: '0x179d59195f5771E907463986bCE98B0369e52837'  // Using contract owner as auditor for minting permissions
};

// Get wallet address by role
export const getWalletByRole = (role) => {
  return FIXED_WALLETS[role.toUpperCase()];
};

// Get role by wallet address
export const getRoleByWallet = (address) => {
  const upperAddress = address.toUpperCase();
  for (const [role, wallet] of Object.entries(FIXED_WALLETS)) {
    if (wallet.toUpperCase() === upperAddress) {
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