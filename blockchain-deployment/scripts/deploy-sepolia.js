import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const { ethers } = hre;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Deploying Blue Carbon Contracts to Sepolia Testnet");
  console.log("=====================================================");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.log("❌ ERROR: Account has no ETH! Please fund your Sepolia account.");
    console.log("💡 Get Sepolia ETH from: https://sepoliafaucet.com/");
    return;
  }

  try {
    // Deploy CarbonCreditToken
    console.log("\n🪙 Deploying CarbonCreditToken...");
    const Token = await ethers.getContractFactory("CarbonCreditToken");
    const token = await Token.deploy(deployer.address);
    await token.waitForDeployment();
    
    const tokenAddress = await token.getAddress();
    console.log("✅ CarbonCreditToken deployed to:", tokenAddress);

    // Deploy Marketplace
    console.log("\n🏪 Deploying Marketplace...");
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(tokenAddress);
    await marketplace.waitForDeployment();
    
    const marketplaceAddress = await marketplace.getAddress();
    console.log("✅ Marketplace deployed to:", marketplaceAddress);

    // Admin keeps ownership of token for minting control
    console.log("\n✅ Admin retains token ownership for verification & minting");

    // Save deployment addresses
    const deploymentInfo = {
      network: "sepolia",
      chainId: 11155111,
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        CarbonCreditToken: {
          address: tokenAddress,
          name: "BlueCarbonCredit",
          symbol: "BCC"
        },
        Marketplace: {
          address: marketplaceAddress
        }
      },
      transactionHashes: {
        tokenDeployment: token.deploymentTransaction()?.hash,
        marketplaceDeployment: marketplace.deploymentTransaction()?.hash
      }
    };

    // Write to deployment file
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const deploymentFile = path.join(deploymentsDir, "sepolia.json");
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    // Update frontend config
    const frontendConfigPath = path.join(__dirname, "../../src/blockchain-integration/config.ts");
    let configContent = fs.readFileSync(frontendConfigPath, "utf8");
    
    // Replace the empty contract addresses with deployed addresses
    configContent = configContent.replace(
      'CARBON_CREDIT_TOKEN: "",',
      `CARBON_CREDIT_TOKEN: "${tokenAddress}",`
    );
    configContent = configContent.replace(
      'MARKETPLACE: ""',
      `MARKETPLACE: "${marketplaceAddress}"`
    );
    
    fs.writeFileSync(frontendConfigPath, configContent);

    console.log("\n🎉 Deployment Complete!");
    console.log("========================");
    console.log("📋 Contract Addresses:");
    console.log("   CarbonCreditToken:", tokenAddress);
    console.log("   Marketplace:", marketplaceAddress);
    console.log("\n📁 Files Updated:");
    console.log("   Deployment Info:", deploymentFile);
    console.log("   Frontend Config:", frontendConfigPath);
    console.log("\n🔍 Verify Contracts:");
    console.log(`   npx hardhat verify --network sepolia ${tokenAddress} "BlueCarbonCredit" "BCC" "${deployer.address}"`);
    console.log(`   npx hardhat verify --network sepolia ${marketplaceAddress} ${tokenAddress}`);
    console.log("\n🌐 View on Etherscan:");
    console.log(`   Token: https://sepolia.etherscan.io/address/${tokenAddress}`);
    console.log(`   Marketplace: https://sepolia.etherscan.io/address/${marketplaceAddress}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });