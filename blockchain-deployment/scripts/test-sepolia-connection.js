// Test Sepolia connection and verify contract deployment
const { ethers } = require('hardhat');

async function main() {
  console.log('🌐 Testing Sepolia Connection...\n');
  
  // Contract addresses
  const TOKEN_ADDRESS = '0x025614e8Dc0b1eb488604D6f6C85982b85f9665B';
  const MARKETPLACE_ADDRESS = '0x4510c03bAb31E60fd99839A6eA3685f83dd3479D';
  
  // Wallet addresses
  const WALLETS = {
    NGO: '0x24cF2631Cd812089e14da2Bb6d7A7C5505258656',
    COMPANY: '0x179d59195f5771E907463986bCE98B0369e52837',
    AUDITOR: '0xDBFd5Ac809f47D72C46354D30972523827479964'
  };
  
  try {
    // Get provider and check network
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    console.log('🔗 Connected to network:', network.name, `(Chain ID: ${network.chainId})`);
    
    if (network.chainId !== 11155111n) {
      console.log('⚠️  Not connected to Sepolia testnet!');
      return;
    }
    
    // Check contract deployment
    const tokenCode = await provider.getCode(TOKEN_ADDRESS);
    const marketplaceCode = await provider.getCode(MARKETPLACE_ADDRESS);
    
    console.log('📜 Token contract deployed:', tokenCode !== '0x' ? '✅' : '❌');
    console.log('📜 Marketplace contract deployed:', marketplaceCode !== '0x' ? '✅' : '❌');
    
    if (tokenCode === '0x') {
      console.log('❌ Token contract not found at:', TOKEN_ADDRESS);
      return;
    }
    
    // Contract ABI
    const TOKEN_ABI = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function owner() view returns (address)",
      "function balanceOf(address account) view returns (uint256)",
      "function totalSupply() view returns (uint256)"
    ];
    
    // Connect to token contract
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
    
    // Get contract info
    const name = await tokenContract.name();
    const symbol = await tokenContract.symbol();
    const owner = await tokenContract.owner();
    const totalSupply = await tokenContract.totalSupply();
    
    console.log('\n📋 Contract Information:');
    console.log('🏷️  Name:', name);
    console.log('🔖 Symbol:', symbol);
    console.log('👑 Owner:', owner);
    console.log('💰 Total Supply:', ethers.formatEther(totalSupply), symbol);
    
    // Check wallet balances
    console.log('\n💳 Wallet Balances:');
    for (const [role, address] of Object.entries(WALLETS)) {
      try {
        const ethBalance = await provider.getBalance(address);
        const tokenBalance = await tokenContract.balanceOf(address);
        
        console.log(`${role.padEnd(8)}: ETH ${ethers.formatEther(ethBalance).substring(0, 8)} | ${symbol} ${ethers.formatEther(tokenBalance).substring(0, 8)}`);
      } catch (error) {
        console.log(`${role.padEnd(8)}: Error checking balance`);
      }
    }
    
    // Check ownership and permissions
    console.log('\n🔐 Permissions:');
    console.log('Contract Owner:', owner);
    console.log('Can Auditor mint?', owner.toLowerCase() === WALLETS.AUDITOR.toLowerCase() ? '✅ YES' : '❌ NO');
    
    if (owner.toLowerCase() !== WALLETS.AUDITOR.toLowerCase()) {
      console.log('\n💡 SOLUTION: Run the grant-auditor-permissions.js script to fix minting permissions');
      console.log('🔧 Command: npx hardhat run scripts/grant-auditor-permissions.js --network sepolia');
    }
    
    console.log('\n🎉 Sepolia connection test completed!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('• MetaMask is connected to Sepolia testnet');
    console.log('• You have Sepolia ETH for gas fees');
    console.log('• Contract addresses are correct');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });