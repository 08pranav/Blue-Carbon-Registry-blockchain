import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { createRequire } from "module";

const { ethers } = hre;
const { deployCore } = createRequire(import.meta.url)("./deployCore.cjs");
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
    console.log("\n🪙🏪 Deploying CarbonCreditToken + Marketplace, then handing token ownership to the Marketplace...");
    const { token, marketplace, tokenAddress, marketplaceAddress, transferOwnershipTx } = await deployCore(ethers, deployer);
    console.log("✅ CarbonCreditToken deployed to:", tokenAddress);
    console.log("✅ Marketplace deployed to:", marketplaceAddress);
    console.log("✅ Token ownership transferred to the Marketplace (tx " + transferOwnershipTx + ")");
    console.log("   Mint BCC with Marketplace.verifyNGO() from the admin wallet:", deployer.address);

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
        marketplaceDeployment: marketplace.deploymentTransaction()?.hash,
        tokenOwnershipTransfer: transferOwnershipTx
      },
      tokenOwner: marketplaceAddress,
      marketplaceAdmin: deployer.address
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
    
    // Replace the addresses inside the SEPOLIA block of the frontend config
    configContent = configContent.replace(
      /(SEPOLIA:\s*\{\s*CARBON_CREDIT_TOKEN:\s*")[^"]*(",\s*MARKETPLACE:\s*")[^"]*(")/,
      `$1${tokenAddress}$2${marketplaceAddress}$3`
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
    console.log(`   npx hardhat verify --network sepolia ${tokenAddress} "${deployer.address}"`);
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