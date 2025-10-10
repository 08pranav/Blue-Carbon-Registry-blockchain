import hre from "hardhat";

const { ethers } = hre;

async function main() {
  console.log("🔍 Checking Marketplace Contract State");
  console.log("=====================================");
  
  // Contract addresses
  const marketplaceAddress = "0x7A8862493655BdBC9058eb11d97E589516cfAD12";
  
  // Get the marketplace contract
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = Marketplace.attach(marketplaceAddress);
  
  try {
    // Check admin
    const admin = await marketplace.admin();
    console.log("📋 Admin address:", admin);
    
    // Check next NGO ID
    const nextNgoId = await marketplace.nextNgoId();
    console.log("🆔 Next NGO ID:", nextNgoId.toString());
    
    // Check next Company ID
    const nextCompanyId = await marketplace.nextCompanyId();
    console.log("🏢 Next Company ID:", nextCompanyId.toString());
    
    // Check if any NGOs are registered
    if (nextNgoId > 1) {
      console.log("\n📝 Registered NGOs:");
      for (let i = 1n; i < nextNgoId; i++) {
        try {
          const ngo = await marketplace.getNgoById(i);
          console.log(`NGO ${i}:`, {
            wallet: ngo.wallet,
            name: ngo.name,
            status: ngo.status.toString(),
            creditsAllocated: ngo.creditsAllocated.toString()
          });
        } catch (e) {
          console.log(`NGO ${i}: Not found or error`);
        }
      }
    } else {
      console.log("\n❌ No NGOs registered yet!");
      console.log("💡 You need to register an NGO first before verifying it.");
    }
    
    // Check token contract
    const tokenAddress = await marketplace.token();
    console.log("\n🪙 Token contract:", tokenAddress);
    
  } catch (error) {
    console.error("❌ Error checking contract state:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });