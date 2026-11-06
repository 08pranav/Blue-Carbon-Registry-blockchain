import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

// Deploys CarbonCreditToken + Marketplace to a local Hardhat node
// (start one with `npx hardhat node`), hands token ownership to the Marketplace,
// writes deployments/localhost.json and a ../.env.local that points the frontend at the
// local chain (Hardhat accounts #0/#1/#2 become Auditor/NGO/Company).
const { ethers } = hre;
const { deployCore } = createRequire(import.meta.url)("./deployCore.cjs");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const [deployer, ngo, company] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const { tokenAddress, marketplaceAddress } = await deployCore(ethers, deployer);
  console.log("CarbonCreditToken:", tokenAddress);
  console.log("Marketplace:     ", marketplaceAddress);
  console.log("Token owner is now the Marketplace; Marketplace admin (auditor):", deployer.address);

  const chainId = Number((await ethers.provider.getNetwork()).chainId);
  const out = path.join(__dirname, "../deployments");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(
    path.join(out, `${hre.network.name}.json`),
    JSON.stringify(
      {
        network: hre.network.name,
        chainId,
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

  const envPath = path.join(__dirname, "../../.env.local");
  fs.writeFileSync(
    envPath,
    [
      "# Written by `npm run deploy:local`: points the frontend at your local Hardhat node.",
      "VITE_NETWORK=LOCAL",
      `VITE_LOCAL_TOKEN_ADDRESS=${tokenAddress}`,
      `VITE_LOCAL_MARKETPLACE_ADDRESS=${marketplaceAddress}`,
      `VITE_AUDITOR_WALLET=${deployer.address}`,
      `VITE_NGO_WALLET=${ngo.address}`,
      `VITE_COMPANY_WALLET=${company.address}`,
      "",
    ].join("\n")
  );
  console.log("Wrote .env.local (restart `npm run dev` to pick it up). Delete it to go back to Sepolia.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
