import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Deploys CarbonCreditToken + Marketplace to a local Hardhat node
// (start one with `npx hardhat node`), and writes deployments/localhost.json.
const { ethers } = hre;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const token = await (await ethers.getContractFactory("CarbonCreditToken")).deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  const marketplace = await (await ethers.getContractFactory("Marketplace")).deploy(tokenAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();

  console.log("CarbonCreditToken:", tokenAddress);
  console.log("Marketplace:     ", marketplaceAddress);

  const out = path.join(__dirname, "../deployments");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(
    path.join(out, `${hre.network.name}.json`),
    JSON.stringify(
      {
        network: hre.network.name,
        chainId: Number((await ethers.provider.getNetwork()).chainId),
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
          CarbonCreditToken: { address: tokenAddress, name: "BlueCarbonCredit", symbol: "BCC" },
          Marketplace: { address: marketplaceAddress },
        },
      },
      null,
      2
    )
  );
  console.log(`Saved deployments/${hre.network.name}.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
