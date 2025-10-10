import hre from "hardhat";

async function main() {
    console.log("🔐 Granting MINTER_ROLE to Marketplace Contract\n");

    // Get contract instances
    const tokenAddress = "0x025614e8Dc0b1eb488604D6f6C85982b85f9665B";
    const marketplaceAddress = "0x4510c03bAb31E60fd99839A6eA3685f83dd3479D";
    
    const token = await hre.ethers.getContractAt("CarbonCreditToken", tokenAddress);
    
    const [admin] = await hre.ethers.getSigners();
    console.log("🔑 Admin address:", admin.address);
    console.log("🏪 Marketplace address:", marketplaceAddress);
    console.log("🪙 Token address:", tokenAddress);

    // Check current roles
    console.log("\n=== Current Roles ===");
    const MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    
    console.log("MINTER_ROLE hash:", MINTER_ROLE);
    
    const hasAdminRole = await token.hasRole(DEFAULT_ADMIN_ROLE, admin.address);
    const hasMinterRole = await token.hasRole(MINTER_ROLE, marketplaceAddress);
    
    console.log("Admin has DEFAULT_ADMIN_ROLE:", hasAdminRole);
    console.log("Marketplace has MINTER_ROLE:", hasMinterRole);

    if (!hasAdminRole) {
        console.log("❌ Error: Current wallet doesn't have admin rights!");
        console.log("Make sure you're using the wallet that deployed the contracts.");
        return;
    }

    if (hasMinterRole) {
        console.log("✅ Marketplace already has MINTER_ROLE!");
        return;
    }

    // Grant MINTER_ROLE to marketplace
    console.log("\n=== Granting MINTER_ROLE ===");
    try {
        const tx = await token.grantRole(MINTER_ROLE, marketplaceAddress);
        console.log("📝 Transaction hash:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("✅ MINTER_ROLE granted in block:", receipt.blockNumber);
        
        // Verify the change
        const newHasMinterRole = await token.hasRole(MINTER_ROLE, marketplaceAddress);
        console.log("🔍 Verification - Marketplace has MINTER_ROLE:", newHasMinterRole);
        
        if (newHasMinterRole) {
            console.log("\n🎉 SUCCESS! Marketplace can now mint tokens!");
            console.log("🌊 NGO verification and token minting should work now.");
        }
        
    } catch (error) {
        console.log("❌ Failed to grant MINTER_ROLE:", error.message);
        
        if (error.message.includes("AccessControl")) {
            console.log("\n💡 Possible solutions:");
            console.log("1. Make sure you're using the wallet that deployed the token contract");
            console.log("2. The admin role might have been transferred to another address");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });