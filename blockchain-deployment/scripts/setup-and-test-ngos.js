import hre from "hardhat";

async function main() {
    console.log("🌱 Setting up NGOs for Testing\n");

    // Get contract instances (new addresses)
    const marketplace = await hre.ethers.getContractAt("Marketplace", "0x4510c03bAb31E60fd99839A6eA3685f83dd3479D");

    const [admin] = await hre.ethers.getSigners();
    console.log("🔑 Admin address:", admin.address);

    // Register a test NGO
    console.log("\n=== Registering Test NGO ===");
    
    try {
        const tx = await marketplace.registerNGO(
            "0x24cF2631Cd812089e14da2Bb6d7A7C5505258656",
            "Test NGO Ocean Conservation",
            "QmTestHashForDocuments123"
        );
        console.log("📝 Registration transaction:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("✅ NGO registered in block:", receipt.blockNumber);
        
        // Check the registered NGO
        const ngo = await marketplace.ngos(1);
        console.log("\n📊 Registered NGO details:");
        console.log("Wallet:", ngo.wallet);
        console.log("Status:", ngo.status.toString());
        console.log("Credits Allocated:", ngo.creditsAllocated.toString());
        console.log("Name:", ngo.name);
        console.log("Documents Hash:", ngo.documentsHash);
        
        // Check next NGO ID
        const nextNgoId = await marketplace.nextNgoId();
        console.log("Next NGO ID:", nextNgoId.toString());
        
    } catch (error) {
        console.log("❌ Registration failed:", error.message);
    }

    // Now test verification
    console.log("\n=== Testing NGO Verification ===");
    
    try {
        const ngoId = 1;
        const newStatus = 2; // Verified
        const creditsToAllocate = 1000;
        
        console.log(`Verifying NGO ${ngoId} with ${creditsToAllocate} credits...`);
        
        const tx = await marketplace.verifyNGO(ngoId, newStatus, creditsToAllocate);
        console.log("📝 Verification transaction:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("✅ NGO verified in block:", receipt.blockNumber);
        
        // Check the updated NGO
        const ngo = await marketplace.ngos(1);
        console.log("\n📊 Updated NGO details:");
        console.log("Wallet:", ngo.wallet);
        console.log("Status:", ngo.status.toString());
        console.log("Credits Allocated:", ngo.creditsAllocated.toString());
        console.log("Date Verified:", ngo.dateVerified.toString());
        
    } catch (error) {
        console.log("❌ Verification failed:", error.message);
        
        if (error.data) {
            console.log("Error data:", error.data);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Script failed:", error);
        process.exit(1);
    });