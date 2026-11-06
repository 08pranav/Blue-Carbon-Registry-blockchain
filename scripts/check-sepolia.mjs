// Read-only check of the live Sepolia deployment. No private key needed.
// Usage: node scripts/check-sepolia.mjs   (optionally SEPOLIA_RPC_URL=... to override)
import { JsonRpcProvider, Contract, formatEther, formatUnits, getAddress } from "ethers";
import { readFileSync } from "node:fs";

const RPC_URLS = [
  process.env.SEPOLIA_RPC_URL,
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://rpc.sepolia.org",
].filter(Boolean);

// Parse the same files the app uses, so this script cannot drift from the config.
const configSrc = readFileSync(new URL("../src/blockchain-integration/config.ts", import.meta.url), "utf8");
const sepolia = configSrc.match(/SEPOLIA:\s*\{\s*CARBON_CREDIT_TOKEN:\s*"(0x[0-9a-fA-F]{40})",\s*MARKETPLACE:\s*"(0x[0-9a-fA-F]{40})"/);
if (!sepolia) throw new Error("Could not read Sepolia addresses from config.ts");
const [TOKEN, MARKET] = [sepolia[1], sepolia[2]];

const walletsSrc = readFileSync(new URL("../src/utils/fixedWallets.ts", import.meta.url), "utf8");
const wallets = {};
// Defaults from fixedWallets.ts, overridable with the same VITE_*_WALLET env vars the app uses.
for (const m of walletsSrc.matchAll(/(NGO|COMPANY|AUDITOR):\s*'(0x[0-9a-fA-F]{40})'/g)) wallets[m[1]] = process.env[`VITE_${m[1]}_WALLET`] || m[2];

async function connect() {
  for (const url of RPC_URLS) {
    try {
      const p = new JsonRpcProvider(url, 11155111, { staticNetwork: true });
      await p.getBlockNumber();
      console.log(`RPC: ${url}`);
      return p;
    } catch { /* try next */ }
  }
  throw new Error("No Sepolia RPC reachable");
}

const provider = await connect();
const token = new Contract(TOKEN, [
  "function name() view returns (string)", "function symbol() view returns (string)",
  "function decimals() view returns (uint8)", "function owner() view returns (address)",
  "function totalSupply() view returns (uint256)", "function balanceOf(address) view returns (uint256)",
], provider);
const market = new Contract(MARKET, [
  "function admin() view returns (address)", "function token() view returns (address)",
  "function nextTradeId() view returns (uint256)", "function nextNgoId() view returns (uint256)",
  "function nextCompanyId() view returns (uint256)",
], provider);

const problems = [];
for (const [label, addr] of [["CarbonCreditToken", TOKEN], ["Marketplace", MARKET]]) {
  const code = await provider.getCode(addr);
  const ok = code !== "0x";
  console.log(`${label} ${addr}: ${ok ? `code present (${(code.length - 2) / 2} bytes)` : "NO CODE"}`);
  if (!ok) problems.push(`${label} has no code at ${addr}`);
}

const owner = await token.owner();
const decimals = Number(await token.decimals());
const supply = await token.totalSupply();
const admin = await market.admin();
const mToken = await market.token();
console.log(`\nToken: ${await token.name()} (${await token.symbol()}), decimals=${decimals}`);
console.log(`Token.owner():       ${owner}`);
console.log(`Market.admin():      ${admin}`);
console.log(`Market.token():      ${mToken}`);
console.log(`totalSupply():       ${formatUnits(supply, decimals)} BCC (raw ${supply})`);
console.log(`nextTradeId():       ${await market.nextTradeId()}  (${(await market.nextTradeId()) - 1n} trades so far)`);
console.log(`nextNgoId():         ${await market.nextNgoId()}`);
console.log(`nextCompanyId():     ${await market.nextCompanyId()}`);

console.log("\nDemo wallets (src/utils/fixedWallets.ts defaults):");
for (const [role, addr] of Object.entries(wallets)) {
  const [bcc, eth] = await Promise.all([token.balanceOf(addr), provider.getBalance(addr)]);
  console.log(`  ${role.padEnd(8)} ${addr}  BCC=${formatUnits(bcc, decimals)}  ETH=${formatEther(eth)}`);
}

console.log("\nChecks (expected design: Marketplace owns the token, auditor wallet is the Marketplace admin):");
if (getAddress(mToken) !== getAddress(TOKEN)) problems.push(`Marketplace.token() ${mToken} != configured token ${TOKEN}`);
if (getAddress(owner) !== getAddress(MARKET)) problems.push(`Token.owner() is ${owner}, not the Marketplace: Marketplace.verifyNGO() cannot mint`);
else console.log("  OK  Token.owner() is the Marketplace");
if (wallets.AUDITOR && getAddress(admin) !== getAddress(wallets.AUDITOR)) problems.push(`Marketplace.admin() ${admin} != AUDITOR wallet ${wallets.AUDITOR}: the app's auditor cannot issue credits`);
else console.log("  OK  Marketplace.admin() is the AUDITOR wallet");
console.log(problems.length ? "\nMISMATCHES:\n - " + problems.join("\n - ") : "\nNo mismatches found.");
process.exit(problems.length ? 1 : 0);
