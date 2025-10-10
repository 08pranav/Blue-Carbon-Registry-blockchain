import hre from "hardhat";

const { ethers } = hre;

async function main() {
  console.log("🔍 Testing NGO Verification");
  console.log("============================");
  
  // Contract addresses
  const marketplaceAddress = "0x7A8862493655BdBC9058eb11d97E589516cfAD12";
  
  // Get the marketplace contract
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = Marketplace.attach(marketplaceAddress);
  
  try {
    // Check NGO ID 1
    const ngoId = 1;
    console.log(`🔍 Checking NGO ID ${ngoId}...`);
    
    const ngo = await marketplace.getNgoById(ngoId);
    console.log("NGO Details:", {
      ngoId: ngo.ngoId.toString(),
      wallet: ngo.wallet,
      name: ngo.name,
      status: ngo.status.toString(),
      documentsHash: ngo.documentsHash,
      creditsAllocated: ngo.creditsAllocated.toString(),
      dateVerified: ngo.dateVerified.toString()
    });
    
    // Check if NGO exists in mapping
    if (ngo.wallet === "0x0000000000000000000000000000000000000000") {
      console.log("❌ NGO doesn't exist!");
      return;
    }
    
    // Check current status
    console.log(`📊 Current Status: ${ngo.status} (${getStatusName(ngo.status)})`);
    
    // Try to verify (simulate the call first)
    console.log("\n🧪 Testing verification call...");
    
    const [deployer] = await ethers.getSigners();
    console.log("🔑 Calling from:", deployer.address);
    
    // Check if caller is admin
    const admin = await marketplace.admin();
    console.log("👑 Contract admin:", admin);
    console.log("🔒 Is caller admin?", deployer.address.toLowerCase() === admin.toLowerCase());
    
    if (deployer.address.toLowerCase() !== admin.toLowerCase()) {
      console.log("❌ ERROR: You're not the admin! Connect with the admin wallet.");
      return;
    }
    
    // Test the verification call
    const newStatus = 2; // Verified
    const creditsToAllocate = 1000;
    
    console.log(`📝 Attempting to verify NGO ${ngoId} with status ${newStatus} and ${creditsToAllocate} credits...`);
    
    // Estimate gas first
    try {
      const gasEstimate = await marketplace.verifyNGO.estimateGas(ngoId, newStatus, creditsToAllocate);
      console.log("⛽ Gas estimate:", gasEstimate.toString());
    } catch (gasError) {
      console.log("❌ Gas estimation failed:", gasError.message);
      
      // Try to get more details about the revert
      try {
        await marketplace.verifyNGO.staticCall(ngoId, newStatus, creditsToAllocate);
      } catch (staticError) {
        console.log("❌ Static call failed:", staticError.message);
        
        // Check specific conditions
        if (newStatus !== 2 && newStatus !== 3) {
          console.log("💡 Status must be 2 (Verified) or 3 (Rejected)");
        }
        
        // Check if token contract is accessible
        const tokenAddress = await marketplace.token();
        const Token = await ethers.getContractFactory("CarbonCreditToken");
        const token = Token.attach(tokenAddress);
        
        try {
          const tokenOwner = await token.owner();
          console.log("🪙 Token owner:", tokenOwner);
          console.log("🔒 Is marketplace owner of token?", tokenOwner.toLowerCase() === admin.toLowerCase());
          
          if (tokenOwner.toLowerCase() !== admin.toLowerCase()) {
            console.log("❌ ERROR: Admin doesn't own the token contract! Cannot mint credits.");
            console.log("💡 Solution: Transfer token ownership back to admin or update minting permissions.");
          }
        } catch (tokenError) {
          console.log("❌ Token check failed:", tokenError.message);
        }
      }
      return;
    }
    
    // If gas estimation worked, try the actual call
    console.log("✅ Gas estimation successful, executing transaction...");
    const tx = await marketplace.verifyNGO(ngoId, newStatus, creditsToAllocate);
    console.log("📤 Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("📋 Gas used:", receipt.gasUsed.toString());
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

function getStatusName(status) {
  const statusNames = ["None", "Pending", "Verified", "Rejected"];
  return statusNames[Number(status)] || "Unknown";
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });