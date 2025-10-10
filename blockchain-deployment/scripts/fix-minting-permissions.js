import hre from "hardhat";

async function main() {
    console.log("🔧 Fix Token Minting Permissions\n");

    // Get contract instances
    const token = await hre.ethers.getContractAt("CarbonCreditToken", "0x025614e8Dc0b1eb488604D6f6C85982b85f9665B");
    const marketplace = await hre.ethers.getContractAt("Marketplace", "0x4510c03bAb31E60fd99839A6eA3685f83dd3479D");

    const [admin] = await hre.ethers.getSigners();
    console.log("🔑 Admin address:", admin.address);

    // Check current token owner
    console.log("\n=== Current Token State ===");
    const tokenOwner = await token.owner();
    console.log("Token owner:", tokenOwner);
    console.log("Marketplace contract:", marketplace.target);
    console.log("Is admin owner:", admin.address === tokenOwner);

    // The issue: marketplace.verifyNGO() calls token.mint()
    // But only the token owner can mint
    // Solution: Admin (token owner) needs to either:
    // 1. Transfer ownership to marketplace, OR
    // 2. Add a minter role, OR  
    // 3. Modify the contract design

    console.log("\n=== Solution: Add Minter Role ===");
    
    // Check if token has a minter role function
    try {
        // Try to set the marketplace as a minter (this will fail if function doesn't exist)
        const tx = await token.setMinter(marketplace.target);
        console.log("📝 Setting minter transaction:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("✅ Minter role set in block:", receipt.blockNumber);
        
    } catch (error) {
        console.log("❌ Minter role not available:", error.message);
        
        console.log("\n🔄 Alternative: Transfer ownership to marketplace");
        try {
            const tx = await token.transferOwnership(marketplace.target);
            console.log("📝 Transfer ownership transaction:", tx.hash);
            
            const receipt = await tx.wait();
            console.log("✅ Ownership transferred in block:", receipt.blockNumber);
            
            // Verify the change
            const newOwner = await token.owner();
            console.log("New token owner:", newOwner);
            
        } catch (error2) {
            console.log("❌ Transfer ownership failed:", error2.message);
            
            console.log("\n📋 Manual fix needed:");
            console.log("The token contract needs to allow the marketplace to mint tokens.");
            console.log("Current design: only token owner can mint");
            console.log("Marketplace calls: token.mint() in verifyNGO()");
            console.log("Solution: Modify token contract to have minter role or different design");
        }
    }

    // Test if we can now verify NGOs
    console.log("\n=== Testing NGO Verification After Fix ===");
    
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
        
        // Check token balance
        const balance = await token.balanceOf(ngo.wallet);
        console.log("Token balance:", balance.toString());
        
    } catch (error) {
        console.log("❌ Verification still failing:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Script failed:", error);
        process.exit(1);
    });