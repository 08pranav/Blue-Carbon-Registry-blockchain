// SIMPLE PERMISSION FIX - Direct blockchain call
// This bypasses ABI issues by using raw contract calls

const CONTRACTS = {
  TOKEN: "0x025614e8Dc0b1eb488604D6f6C85982b85f9665B",
  MARKETPLACE: "0x4510c03bAb31E60fd99839A6eA3685f83dd3479D"
};

const ROLE_HASHES = {
  MINTER_ROLE: "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6",
  DEFAULT_ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000"
};

export async function fixPermissionsDirectly() {
  if (!window.ethereum) {
    throw new Error("MetaMask not found!");
  }

  const { BrowserProvider } = await import('ethers');
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const currentWallet = await signer.getAddress();

  console.log("🔧 Attempting direct permission fix...");
  console.log("Current wallet:", currentWallet);
  console.log("Token contract:", CONTRACTS.TOKEN);
  console.log("Marketplace contract:", CONTRACTS.MARKETPLACE);

  try {
    // Try to call grantRole directly using the function selector
    // grantRole(bytes32,address) has selector 0x2f2ff15d
    const functionSelector = "0x2f2ff15d";
    const roleParam = ROLE_HASHES.MINTER_ROLE.slice(2).padStart(64, '0');
    const addressParam = CONTRACTS.MARKETPLACE.slice(2).padStart(64, '0');
    
    const calldata = functionSelector + roleParam + addressParam;
    
    console.log("📝 Sending transaction with calldata:", calldata);

    const tx = await signer.sendTransaction({
      to: CONTRACTS.TOKEN,
      data: calldata,
      gasLimit: 100000
    });

    console.log("🔄 Transaction submitted:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

    return {
      success: true,
      txHash: tx.hash,
      message: "Permissions granted successfully!"
    };

  } catch (error) {
    console.error("❌ Direct call failed:", error);
    
    // Fallback: try a different approach
    return tryFallbackMethod(signer);
  }
}

async function tryFallbackMethod(signer) {
  try {
    console.log("🔄 Trying fallback method...");
    
    // Use a very basic ERC20 + AccessControl ABI
    const basicABI = [
      "function grantRole(bytes32 role, address account)",
      "function hasRole(bytes32 role, address account) view returns (bool)",
      "function getRoleAdmin(bytes32 role) view returns (bytes32)"
    ];

    const { Contract } = await import('ethers');
    const contract = new Contract(CONTRACTS.TOKEN, basicABI, signer);

    console.log("📋 Testing hasRole first...");
    const hasRole = await contract.hasRole(ROLE_HASHES.MINTER_ROLE, CONTRACTS.MARKETPLACE);
    console.log("Marketplace already has minter role:", hasRole);

    if (hasRole) {
      return {
        success: true,
        message: "Marketplace already has minter permissions!"
      };
    }

    console.log("🔐 Granting role...");
    const tx = await contract.grantRole(ROLE_HASHES.MINTER_ROLE, CONTRACTS.MARKETPLACE);
    
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: tx.hash,
      message: "Permissions granted via fallback method!"
    };

  } catch (fallbackError) {
    console.error("❌ Fallback also failed:", fallbackError);
    
    return {
      success: false,
      error: "All methods failed. Contract might not support AccessControl or wallet lacks permissions.",
      details: fallbackError.message
    };
  }
}