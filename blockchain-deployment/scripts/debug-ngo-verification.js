import hre from "hardhat";

async function main() {
    console.log("🔍 Debug NGO Verification Issue\n");

    // Get contract instances
    const marketplace = await hre.ethers.getContractAt("Marketplace", "0x4510c03bAb31E60fd99839A6eA3685f83dd3479D");
    const token = await hre.ethers.getContractAt("CarbonCreditToken", "0x025614e8Dc0b1eb488604D6f6C85982b85f9665B");

    const [admin] = await hre.ethers.getSigners();
    console.log("🔑 Admin address:", admin.address);

    // 1. Check contract state
    console.log("\n=== Contract State ===");
    const nextNgoId = await marketplace.nextNgoId();
    console.log("Next NGO ID:", nextNgoId.toString());
    console.log("Valid NGO range: 1 to", (Number(nextNgoId) - 1).toString());

    // 2. Check NGO #1 details
    console.log("\n=== NGO #1 Details ===");
    try {
        const ngo = await marketplace.ngos(1);
        console.log("Wallet:", ngo.wallet);
        console.log("Status:", ngo.status.toString());
        console.log("Credits:", ngo.credits.toString());
        console.log("Is wallet zero:", ngo.wallet === "0x0000000000000000000000000000000000000000");
    } catch (error) {
        console.log("❌ Error reading NGO #1:", error.message);
    }

    // 3. Check admin permissions
    console.log("\n=== Admin Permissions ===");
    const isAdmin = await marketplace.admin();
    console.log("Contract admin:", isAdmin);
    console.log("Is caller admin:", admin.address === isAdmin);

    // 4. Check token ownership
    console.log("\n=== Token Ownership ===");
    const tokenOwner = await token.owner();
    console.log("Token owner:", tokenOwner);
    console.log("Is admin token owner:", admin.address === tokenOwner);

    // 5. Try the verifyNGO function with detailed error handling
    console.log("\n=== Testing verifyNGO Function ===");
    const ngoId = 1;
    const newStatus = 2; // Verified
    const creditsToAllocate = 1000;

    console.log(`Attempting to verify NGO ${ngoId} with status ${newStatus} and ${creditsToAllocate} credits...`);

    try {
        // First, try estimating gas
        console.log("📊 Estimating gas...");
        const gasEstimate = await marketplace.verifyNGO.estimateGas(ngoId, newStatus, creditsToAllocate);
        console.log("✅ Gas estimate:", gasEstimate.toString());

        // Try static call
        console.log("📊 Testing static call...");
        await marketplace.verifyNGO.staticCall(ngoId, newStatus, creditsToAllocate);
        console.log("✅ Static call successful");

        // Actually execute the transaction
        console.log("📊 Executing transaction...");
        const tx = await marketplace.verifyNGO(ngoId, newStatus, creditsToAllocate);
        console.log("✅ Transaction sent:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

    } catch (error) {
        console.log("❌ Verification failed:");
        console.log("Error type:", error.name);
        console.log("Error message:", error.message);
        
        if (error.data) {
            console.log("Error data:", error.data);
        }
        
        if (error.reason) {
            console.log("Error reason:", error.reason);
        }

        // Try to decode the error if possible
        if (error.message.includes("execution reverted")) {
            console.log("\n🔍 This is a smart contract revert. Possible causes:");
            console.log("1. NGO ID validation failed");
            console.log("2. Status transition not allowed");
            console.log("3. Mint function failed (token contract issue)");
            console.log("4. Hidden require statement in contract");
        }
    }

    // 6. Additional debugging - check if we can read contract code
    console.log("\n=== Contract Code Check ===");
    const marketplaceCode = await hre.ethers.provider.getCode("0x4510c03bAb31E60fd99839A6eA3685f83dd3479D");
    console.log("Marketplace contract deployed:", marketplaceCode !== "0x");
    
    const tokenCode = await hre.ethers.provider.getCode("0x025614e8Dc0b1eb488604D6f6C85982b85f9665B");
    console.log("Token contract deployed:", tokenCode !== "0x");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Script failed:", error);
        process.exit(1);
    });