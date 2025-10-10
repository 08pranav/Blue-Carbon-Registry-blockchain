import hre from "hardhat";

async function main() {
    console.log("🔐 Grant MINTER_ROLE to Marketplace - SIMPLE FIX\n");

    const tokenAddress = "0x025614e8Dc0b1eb488604D6f6C85982b85f9665B";
    const marketplaceAddress = "0x4510c03bAb31E60fd99839A6eA3685f83dd3479D";

    console.log("🪙 Token Contract:", tokenAddress);
    console.log("🏪 Marketplace Contract:", marketplaceAddress);

    try {
        // Get the deployed token contract
        const token = await hre.ethers.getContractAt("CarbonCreditToken", tokenAddress);
        
        const [deployer] = await hre.ethers.getSigners();
        console.log("🔑 Using wallet:", deployer.address);

        // Calculate MINTER_ROLE
        const MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));
        console.log("📋 MINTER_ROLE hash:", MINTER_ROLE);

        // Check current roles
        const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
        const hasAdminRole = await token.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
        const marketplaceHasMinterRole = await token.hasRole(MINTER_ROLE, marketplaceAddress);

        console.log("\n=== Current Status ===");
        console.log("Deployer has admin role:", hasAdminRole);
        console.log("Marketplace has minter role:", marketplaceHasMinterRole);

        if (!hasAdminRole) {
            console.log("\n❌ ERROR: Current wallet does not have admin role!");
            console.log("Make sure you're using the wallet that deployed the contracts.");
            return;
        }

        if (marketplaceHasMinterRole) {
            console.log("\n✅ SUCCESS: Marketplace already has MINTER_ROLE!");
            console.log("🌊 You can now approve projects and mint carbon credits!");
            return;
        }

        console.log("\n🔄 Granting MINTER_ROLE to marketplace...");
        
        // Grant the role
        const tx = await token.grantRole(MINTER_ROLE, marketplaceAddress);
        console.log("📝 Transaction submitted:", tx.hash);
        
        console.log("⏳ Waiting for confirmation...");
        const receipt = await tx.wait();
        console.log("✅ Confirmed in block:", receipt.blockNumber);

        // Verify the role was granted
        const finalCheck = await token.hasRole(MINTER_ROLE, marketplaceAddress);
        
        if (finalCheck) {
            console.log("\n🎉 SUCCESS! MINTER_ROLE granted to marketplace!");
            console.log("🌊 Now you can:");
            console.log("  ✅ Approve NGO projects");
            console.log("  ✅ Mint carbon credit tokens");
            console.log("  ✅ Execute real blockchain transactions");
            console.log("\n🔗 Etherscan:", `https://sepolia.etherscan.io/tx/${tx.hash}`);
        } else {
            console.log("\n❌ FAILED: Role was not granted properly");
        }

    } catch (error) {
        console.error("\n❌ Error:", error.message);
        
        if (error.message.includes("AccessControl")) {
            console.log("\n💡 This usually means:");
            console.log("1. You're not using the admin wallet");
            console.log("2. The admin role was transferred to another address");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });