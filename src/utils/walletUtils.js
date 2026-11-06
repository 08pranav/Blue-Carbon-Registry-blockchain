import { FIXED_WALLETS } from './fixedWallets';

// Show wallet information during transactions
export const showWalletTransactionInfo = (fromRole, toRole, amount, type, txHash = null) => {
  const fromWallet = FIXED_WALLETS[fromRole];
  const toWallet = FIXED_WALLETS[toRole];
  
  const transactionType = type === 'mint' ? 'MINTING' : 'TRANSFER';
  
  const message = `
🌊 BLOCKCHAIN ${transactionType} SUCCESS!

📋 Transaction Details:
• Amount: ${amount} tokens
• Type: ${type === 'mint' ? 'Carbon Credit Minting' : 'Token Transfer'}

🏦 FROM: ${fromRole} Wallet
${fromWallet}

🏛️ TO: ${toRole} Wallet  
${toWallet}

${txHash ? `🔗 Transaction Hash: ${txHash}` : ''}

💰 Check your MetaMask to see the transaction!
  `;
  
  return message.trim();
};

// Validate wallet connection for role
export const validateWalletConnection = (connectedWallet, requiredRole) => {
  const expectedWallet = FIXED_WALLETS[requiredRole];
  
  if (!connectedWallet) {
    return {
      valid: false,
      message: `❌ No wallet connected!\n\nPlease connect your ${requiredRole} wallet:\n${expectedWallet}`
    };
  }
  
  if (connectedWallet.toLowerCase() !== expectedWallet.toLowerCase()) {
    return {
      valid: false,
      message: `⚠️ Wrong Wallet Connected!\n\nExpected ${requiredRole} wallet:\n${expectedWallet}\n\nCurrently connected:\n${connectedWallet}\n\nPlease switch to the correct wallet in MetaMask.`
    };
  }
  
  return { valid: true };
};

// Get formatted wallet info for UI display
export const getWalletDisplayInfo = (role) => {
  const wallet = FIXED_WALLETS[role];
  return {
    role,
    address: wallet,
    shortAddress: `${wallet.slice(0, 6)}...${wallet.slice(-4)}`,
    fullAddress: wallet
  };
};