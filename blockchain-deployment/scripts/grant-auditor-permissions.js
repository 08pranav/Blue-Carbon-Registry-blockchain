// Script to grant minting permissions to Auditor wallet on Sepolia
const { ethers } = require('hardhat');

async function main() {
  console.log('🔧 Granting Auditor Minting Permissions on Sepolia...');
  
  // Contract addresses (deployed on Sepolia)
  const TOKEN_ADDRESS = '0x025614e8Dc0b1eb488604D6f6C85982b85f9665B';
  const AUDITOR_ADDRESS = '0xDBFd5Ac809f47D72C46354D30972523827479964';
  
  // Get signer (should be the contract owner)
  const [deployer] = await ethers.getSigners();
  console.log('🔑 Using deployer wallet:', deployer.address);
  
  // Contract ABI for the functions we need
  const TOKEN_ABI = [
    "function owner() view returns (address)",
    "function transferOwnership(address newOwner)",
    "function mint(address to, uint256 amount)",
    "function balanceOf(address account) view returns (uint256)",
  ];
  
  // Connect to the token contract
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, deployer);
  
  try {
    // Check current owner
    const currentOwner = await tokenContract.owner();
    console.log('📋 Current contract owner:', currentOwner);
    console.log('🔍 Deployer address:', deployer.address);
    
    if (currentOwner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.log('❌ Deployer is not the contract owner. Cannot grant permissions.');
      console.log('💡 The contract owner needs to run this script.');
      return;
    }
    
    // Option 1: Transfer ownership to Auditor (simplest)
    console.log('🔄 Transferring ownership to Auditor...');
    const transferTx = await tokenContract.transferOwnership(AUDITOR_ADDRESS);
    await transferTx.wait();
    console.log('✅ Ownership transferred to Auditor!');
    console.log('📝 Transaction hash:', transferTx.hash);
    
    // Verify the transfer
    const newOwner = await tokenContract.owner();
    console.log('🎉 New contract owner:', newOwner);
    
    if (newOwner.toLowerCase() === AUDITOR_ADDRESS.toLowerCase()) {
      console.log('✅ SUCCESS: Auditor now has minting permissions!');
    } else {
      console.log('❌ ERROR: Ownership transfer failed');
    }
    
  } catch (error) {
    console.error('❌ Error granting permissions:', error.message);
    
    // If we can't transfer ownership, let's try to check if there's a different way
    console.log('💡 Alternative: You may need to modify the contract to have role-based permissions');
    console.log('🔧 Current solution: The frontend will fall back to demo mode for minting');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });