# Testing the Blue Carbon Registry with MetaMask

This guide walks you through the whole flow (NGO submits a project, Auditor approves it and issues credits, NGO lists them, Company buys them) using MetaMask on the **Sepolia test network**. Everything uses free test ETH, never real money. No MetaMask experience is needed.

**How this guide was checked.** I ran the full flow in a real browser against the running app, with a stand-in wallet on a local Hardhat chain, and confirmed every route, button label and command below. I also ran the app's wallet code against a local chain with `npm run test:e2e-local`. I could not run the real MetaMask pop-ups or Sepolia for you, so the MetaMask screens are described from how the app calls them; wording in MetaMask itself changes between versions.

Contents: [1. Setup](#1-setup) · [2. Accounts for each role](#2-accounts-for-each-role) · [3. Show BCC in MetaMask](#3-show-bcc-in-metamask) · [4. Run the app](#4-run-the-app-locally) · [5. Test script](#5-end-to-end-test-script) · [6. Etherscan](#6-verify-on-etherscan) · [7. Troubleshooting](#7-troubleshooting) · [8. No-faucet local option](#8-local-alternative-without-faucets) · [9. Recording a demo](#9-checklist-for-recording-a-demo-video-or-gif)

---

## 1. Setup

### 1.1 Install MetaMask and make a wallet just for testing
1. Install the MetaMask browser extension from [metamask.io](https://metamask.io/download/) (check the URL; fake copies exist).
2. Create a new wallet and write the Secret Recovery Phrase on paper. **Use this wallet only for testing.** Do not put real funds in it and never share the phrase.

### 1.2 Switch to Sepolia
1. Open MetaMask, click the network selector at the top, and turn on **Show test networks** if it is off.
2. Pick **Sepolia**. It is built into current MetaMask versions. If you do not see it, add it manually:

| Field | Value |
|---|---|
| Network name | Sepolia |
| RPC URL | `https://ethereum-sepolia-rpc.publicnode.com` (the app's own default; `https://rpc.sepolia.org` also works at times) |
| Chain ID | `11155111` |
| Currency symbol | `ETH` |
| Block explorer | `https://sepolia.etherscan.io` |

The app also asks MetaMask to switch to (or add) Sepolia when you connect, so you will usually just click **Approve** / **Switch network**.

### 1.3 Get free Sepolia ETH
Faucets change often. These were working options when I checked; if one is down, search for "Sepolia faucet".

| Faucet | What to expect |
|---|---|
| [Google Cloud Web3 faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) | Needs a Google login; no mainnet balance required; about 0.05 ETH per request, once per 24 h per account |
| [Alchemy Sepolia faucet](https://www.alchemy.com/faucets/ethereum-sepolia) | Up to about 0.1 ETH per day; sources disagree on whether it needs an Alchemy account, and it may require a small real-ETH balance on Ethereum mainnet or recent mainnet activity |
| A proof-of-work faucet (search "Sepolia PoW faucet") | No account or mainnet balance, but you leave a browser tab mining for a while |

Faucets sometimes require a login, a mainnet balance, or simply run dry. That is normal; try another one or come back later.

**How much do you need?** Gas units measured on a local chain: `verifyNGO` 135,874, `approve` 46,406, `executeTrade` 237,957 (`registerNGO` is similar in size to `verifyNGO`). At a Sepolia gas price of 10 gwei, `executeTrade` costs 237,957 × 10 gwei ≈ 0.0024 ETH; gas prices vary, so treat that as an order of magnitude. The Company also pays for the credits: the default listing price is 0.001 ETH per credit, so 10 credits cost 0.01 ETH. **About 0.05 ETH in each of the three wallets is plenty.**

---

## 2. Accounts for each role

The app does not let you pick any wallet. Each role must use a specific address (a mismatch gives **"Wrong wallet connected"**). The addresses come from [`src/utils/fixedWallets.ts`](../src/utils/fixedWallets.ts) and can be overridden with `VITE_NGO_WALLET`, `VITE_AUDITOR_WALLET` and `VITE_COMPANY_WALLET` in a `.env` file (see [`.env.example`](../.env.example)). The login page also shows each role's wallet.

| Role | Default address |
|---|---|
| NGO | `0x24cF2631Cd812089e14da2Bb6d7A7C5505258656` |
| Auditor | `0x179d59195f5771E907463986bCE98B0369e52837` |
| Company | `0x179d59195f5771E907463986bCE98B0369e52837` (same as the Auditor by default) |

The defaults are the project owner's wallets on the live deployment. **You can only use them if you hold their private keys.** Pick one of the two cases below.

### Case A: you control the Auditor/admin wallet (the project owner)
The Auditor wallet must be the **Marketplace admin**, because the Marketplace contract owns the BCC token and only the admin can call `verifyNGO()`, which is the only way to issue credits. On the live Sepolia contracts this is `0x179d…2837`. Import that account into MetaMask (section 2.3). Check at any time with `node scripts/check-sepolia.mjs` (read-only, needs no key).

### Case B: you deploy your own copy to Sepolia
Do this if you do not hold the keys above.

1. In MetaMask create or import a **throwaway** account, fund it from a faucet, and export its private key (account menu → *Account details* → *Show private key*).
2. Create `blockchain-deployment/.env` (it is git-ignored; **never commit it, and never use a key that holds real funds**):
   ```bash
   SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   SEPOLIA_PRIVATE_KEY=<your throwaway private key>
   ```
3. Deploy:
   ```bash
   cd blockchain-deployment
   npm install
   npm run deploy:sepolia
   ```
   The script deploys the token and the Marketplace, transfers token ownership to the Marketplace, prints both addresses, writes `deployments/sepolia.json` and **rewrites the Sepolia addresses in `src/blockchain-integration/config.ts`**. Do not commit that change unless you mean to point the project at your own contracts.
4. Create a `.env` in the project root so your deployer becomes the Auditor, and give the other roles their own accounts:
   ```bash
   VITE_AUDITOR_WALLET=<deployer address>
   VITE_NGO_WALLET=<second MetaMask account>
   VITE_COMPANY_WALLET=<third MetaMask account>
   ```
5. Fund all three accounts (section 1.3).

### 2.3 Add or import several accounts in MetaMask
- **New account:** click the account name at the top → *Add account or hardware wallet* → *Add a new Ethereum account*.
- **Import a key:** same menu → *Import account* → paste a private key.
- **Switch accounts:** click the account name at the top and pick another. MetaMask only shares an account with a site after you connect it, so after switching, click the app's **Connect Wallet** again if the app still shows the old address.

Rename the accounts (NGO, Auditor, Company) so you do not mix them up.

---

## 3. Show BCC in MetaMask

MetaMask does not display custom tokens until you import them.
1. Select the NGO account, open the **Tokens** tab, then *Import* (or *Import tokens*) → *Custom token*.
2. Paste the token contract address:
   - Live Sepolia deployment: `0x025614e8Dc0b1eb488604D6f6C85982b85f9665B`
   - Your own deployment: the `CarbonCreditToken` address printed by the deploy script (also in `deployments/sepolia.json`).
3. MetaMask should fill in the symbol `BCC` and 18 decimals. Confirm. Repeat for the Company account.

---

## 4. Run the app locally

You need Node.js 18 or newer. From the project root:

```bash
# terminal 1: backend API on http://localhost:3001
cd backend
npm install
npm start

# terminal 2: web app
npm install
npm run dev
```

Open **http://localhost:8080**. The dev server forwards `/api` to the backend, so no extra config is needed. Quick check: http://localhost:8080/api/health should show `{"status":"OK",...}`.

The backend keeps everything in memory: **restarting it deletes submitted projects and listings** (the blockchain side is unaffected).

---

## 5. End-to-end test script

Keep the browser tab with the app open. The app uses pop-up `confirm`/`alert` boxes; click **OK** on them. For each transaction MetaMask opens a confirmation window: check the network says Sepolia and the account is the right one, then click **Confirm**. Transactions take a few seconds on Sepolia; wait for the app's success message.

**Step 0: choose which account to use.** In MetaMask, switch to the account named in each step. The app's login page and dashboard header show the wallet address to use ("Wallet to use in MetaMask: 0x…").

### NGO part (MetaMask account: NGO)
1. Open http://localhost:8080/login and click **Login as NGO**. You land on `/dashboard` ("NGO Dashboard").
2. Click **Connect Wallet**. MetaMask asks to connect: choose the NGO account, *Next*, *Connect*. If it asks to switch to Sepolia, approve. *Expect:* a green "🔗 Wallet connected" card with your ETH and BCC (0.0) balance. If it says "Wrong wallet connected", you picked the wrong account.
3. Click **Register NGO on Blockchain** and accept the pop-up question. MetaMask asks you to confirm a transaction (`registerNGO`). *Expect:* an alert "✅ NGO registered on-chain" with the transaction link. *Etherscan:* open it and look for the call `registerNGO` and an `NGORegistered` event. This step is optional: if you skip it, the Auditor's approval registers the NGO for you. If the NGO is already registered you will see an "already registered" notice instead.
4. Open the **Submit New Project** tab and fill in: title, description, location, ecosystem, **Latitude** and **Longitude**, area, expected credits (for example `200`). For **Field photos** pick one or more JPEG/PNG photos. *Tip for a clean screening result:* use real photos at least 800×600 and 30 KB; phone photos with location tags are compared with the latitude/longitude you enter and must be within 1 km.
5. Click **Submit Project for Review** (no MetaMask prompt: this goes to the backend). *Expect:* an alert "submitted for auditor review" with the screening result (`APPROVE`, `NEEDS_REVIEW` or `REJECT`) and a per-photo report on the page. The **My Projects** tab shows the project as PENDING.

### Auditor part (MetaMask account: Auditor)
6. In MetaMask switch to the Auditor account. In the app click **Logout**, go to `/login`, click **Login as AUDITOR**.
7. Click **Connect Wallet** and connect the Auditor account. *Expect:* "🔗 Auditor wallet connected".
8. In the **Pending Review** tab click your project. *Expect:* its description, wallet, coordinates, the photo thumbnails and the "Automated screening" report. Two sample projects from the backend are also listed; you can ignore them.
9. Set **Credits to issue (BCC)** (it defaults to the NGO's estimate), add notes, and click **Approve & Issue BCC**; accept the pop-up question. MetaMask asks you to confirm `verifyNGO`; if the NGO is not yet on-chain, you first confirm `registerNGO`. *Expect:* an alert "✅ … BCC issued to the NGO" with the transaction link, and the project moves to the **Reviewed** tab. *Etherscan:* the `verifyNGO` transaction shows the events `CreditsMinted` (from the Marketplace) and `Transfer` from `0x000…000` (the mint) on the BCC token. If it fails, see the troubleshooting table.

### NGO part again (MetaMask account: NGO)
10. Switch MetaMask to the NGO account, **Logout**, **Login as NGO**, **Connect Wallet**.
11. Open the **Manage Credits** tab. *Expect:* "BCC in your wallet" equals the amount issued, and the stat card **BCC Balance (on-chain)** matches. In MetaMask, the BCC token (section 3) shows the same number.
12. Optional: under your project, enter **Credits to Sell** and **Price per Credit (ETH)** (for example `0.001`) and click **List Credits for Sale**. Approving a project already created a listing at 0.001 ETH for all issued credits; this button changes quantity and price.
13. In the **Approve Credits for On-Chain Sale** box enter how many BCC the Marketplace may sell (at least what the Company will buy, for example `50`) and click **Approve**. MetaMask asks you to confirm an `approve` transaction. *Expect:* an alert "✅ Marketplace approved to sell 50 BCC". *Etherscan:* an `Approval` event on the BCC token. Without this step purchases fail on purpose.

### Company part (MetaMask account: Company)
14. Switch MetaMask to the Company account. **Logout**, then **Login as COMPANY**. (With the defaults this is the same wallet as the Auditor.) *Expect:* the Marketplace Listings show your project with price and available credits. The Company dashboard reads balances without needing **Connect Wallet**; MetaMask connects when you buy.
15. Enter a **Quantity** (for example `10`) and click **Buy Credits**. MetaMask asks you to connect if needed, then to confirm an `executeTrade` transaction that sends `quantity × price` ETH (for example 0.01 ETH). *Expect:* an alert "MARKETPLACE TRADE COMPLETE" with the transaction link; the "Last purchase transaction" bar appears; **BCC Tokens Owned** goes up by 10 and the listing shrinks by 10.
16. **Confirm the result.**
    - In MetaMask, the Company's BCC balance increased by the quantity bought (and the NGO's decreased by the same amount).
    - The NGO account's ETH increased by the price paid. Check on Etherscan: open the NGO address and look at its latest incoming transaction (an *internal transaction* from the Marketplace contract).
    - The trade is also recorded by the backend, so another buyer sees fewer credits.

---

## 6. Verify on Etherscan

Use [sepolia.etherscan.io](https://sepolia.etherscan.io). Open a transaction by pasting its hash (the apps show links) or from the address page's *Transactions* tab.

- **Reading a transaction:** *Status* should be **Success**. *From* is the account that clicked Confirm; *To* is the contract. *Value* is the ETH sent (non-zero for `executeTrade`). *Transaction Fee* is the gas cost.
- **Events:** open the **Logs** tab. If the contract is verified on Etherscan the events are decoded by name; otherwise you see raw topics, where the first topic identifies the event:

| Event | First topic (`topic0`) | Where it appears |
|---|---|---|
| `Transfer(address,address,uint256)` | `0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef` | BCC token: mint (from `0x00…00`) and purchase (NGO → Company) |
| `TradeExecuted(uint256,address,address,uint256,uint256,string)` | `0x1099170c3d3e8c9725fd00df2f172850447f48846ede11fad6474fb1649df3ad` | Marketplace: seller (NGO), buyer (Company), amount, price in wei |
| `CreditsMinted(uint256,address,uint256)` | `0x921c08e825069e4d980f75f8c9d39ab505649f98d18f620f19759e16f0e3ba6b` | Marketplace, on issuance |
| `Approval(address,address,uint256)` | `0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925` | BCC token, when the NGO approves the Marketplace |

- **Token holders:** open the token page (`https://sepolia.etherscan.io/token/<token address>`) and use the **Holders** tab; the **Transfers** tab lists every mint and sale. The token address is `0x025614e8Dc0b1eb488604D6f6C85982b85f9665B` on the live deployment.
- **Amounts** are shown in whole tokens (18 decimals): a raw value of `10000000000000000000` is 10 BCC.

---

## 7. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| "Wrong network" message, or MetaMask says it is on another chain | MetaMask is not on Sepolia | Switch network in MetaMask (section 1.2). The app also asks to switch when you connect; approve it |
| "Wrong wallet connected. Please connect: 0x…" (or the red "Wrong wallet connected" card) | The selected MetaMask account is not the one the role requires | Switch to the address shown, then click **Connect Wallet** again. Or change the role's address with the `VITE_*_WALLET` env vars (section 2) |
| "Insufficient ETH for gas fees" / MetaMask "Insufficient funds" | The account has too little Sepolia ETH (the Company also needs the purchase price) | Use a faucet (section 1.3) |
| `OwnableUnauthorizedAccount` (seen in an error or on Etherscan) | Something called `mint` on the token directly. Only the token's owner, the Marketplace contract, may mint | Issue credits only through the Auditor's **Approve & Issue BCC**. The app also stops with "The connected wallet is not the Marketplace admin" or "The BCC token is owned by …" if the wiring is wrong; run `node scripts/check-sepolia.mjs` |
| "only admin" revert on approval | The connected account is not the Marketplace admin | Connect the Auditor account that deployed the Marketplace (section 2, Case A or B) |
| `ERC20InsufficientAllowance` / "The NGO has only approved X BCC for sale" | The NGO has not approved the Marketplace for enough BCC | NGO: **Manage Credits** → **Approve Credits for On-Chain Sale** (step 13) |
| "Cannot reach the API… Is the backend running?" | Backend is not running | `cd backend && npm start` (section 4) |
| Listing shows 0 credits or the project vanished | The backend restarted and lost its in-memory data | Submit and approve a project again |
| Transaction pending for a long time | Low gas price or a congested network | Wait; in MetaMask use *Speed up*, or *Cancel*. If MetaMask insists a transaction is stuck after restarting a local node, see section 8 |
| MetaMask not detected ("MetaMask not installed") | Extension missing or disabled, or you opened the app in a browser without it | Install/enable MetaMask, make sure it is allowed on `localhost`, reload the page |
| Balances (BCC or ETH) not updating | The page loaded before the transaction finished, or a public RPC is slow | Wait for confirmation on Etherscan, then reload. MetaMask shows its own balance; make sure the BCC token is imported (section 3) |
| Pop-up question or MetaMask window never appears | The browser blocked the pop-up, or MetaMask is waiting in its toolbar icon | Click the MetaMask icon to open the pending request |
| "Transaction was rejected by user" | You clicked Reject | Repeat the step and click Confirm |

---

## 8. Local alternative without faucets

This runs everything on your computer with fake accounts that already have 10,000 ETH. It exercises the same contracts and the same app code.

> **Hardhat's test accounts and their private keys are public** (they are the same on every machine). Import them into MetaMask only for this local chain, never use them on Sepolia or mainnet, and never send real funds to them.

1. Start a local chain (it prints 20 accounts with their private keys and stays running):
   ```bash
   cd blockchain-deployment
   npm install
   npx hardhat node
   ```
2. In a second terminal, deploy:
   ```bash
   cd blockchain-deployment
   npm run deploy:local
   ```
   This deploys both contracts (token ownership goes to the Marketplace), and writes `../.env.local`, which switches the app to the local network and sets the role wallets to Hardhat accounts #0 (Auditor), #1 (NGO) and #2 (Company). Delete `.env.local` to go back to Sepolia.
3. Add the local network in MetaMask (*Add network manually*): name `Hardhat Local`, RPC `http://127.0.0.1:8545`, chain ID `31337`, symbol `ETH`. (The app also offers to add it when you connect.)
4. Import Hardhat accounts #0, #1 and #2 into MetaMask using the private keys printed in the `hardhat node` terminal (section 2.3), and rename them Auditor, NGO, Company. Their addresses are also in `.env.local`.
5. Start the backend and **restart** the frontend so it reads `.env.local` (section 4).
6. Run the same test script (section 5). There is no Etherscan locally: the app shows transaction hashes instead, and you can check results in MetaMask balances and with `npx hardhat console --network localhost`.
7. For the BCC token (section 3) use the token address printed by `deploy:local`.

If you restart `hardhat node`, MetaMask remembers old transaction counts and may report nonce errors or stuck transactions. Fix: MetaMask *Settings → Advanced → Clear activity tab data* (older versions: *Reset account*), for each imported account.

**No-wallet automated check:** `npm run test:e2e-local` starts a Hardhat node, deploys, and runs the app's real mint/approve/buy code against it with a stand-in wallet. It is skipped in normal `npm run test:ci`.

---

## 9. Checklist for recording a demo video or GIF

Before recording
- [ ] Use the local setup (section 8) for a reliable take, or Sepolia with all three wallets funded and the BCC token imported in the NGO and Company accounts.
- [ ] Fresh backend (`npm start` again) so the project list is clean.
- [ ] Browser window about 1280×720, zoom 100%, bookmarks bar and other extensions hidden. Pin MetaMask so its pop-ups are easy to find; consider recording the whole screen so the pop-ups show.
- [ ] Rename MetaMask accounts NGO / Auditor / Company. Never show a Secret Recovery Phrase or private key on screen (the Hardhat keys are public, but still avoid them).
- [ ] Prepare one or two nice photos (JPEG, at least 800×600) and the project text in a notes file.
- [ ] Close notification pop-ups and do a dry run first.

Shots, in order (aim for 60–90 seconds)
1. Home page → **Login** → **Login as NGO** → **Connect Wallet**.
2. **Submit New Project**: filled form with photos → the screening result.
3. Switch to Auditor (show the MetaMask account switch) → open the project → photos and screening → **Approve & Issue BCC** → MetaMask confirm → success alert.
4. NGO → **Manage Credits** → BCC balance → **Approve** → MetaMask confirm.
5. Company → the listing → **Buy Credits** → MetaMask confirm → BCC balance goes up.
6. End on Etherscan (Sepolia) showing the `TradeExecuted` and `Transfer` events, or the BCC holders list.

Tools: macOS Screenshot toolbar (⇧⌘5) to record, then convert to GIF with a tool such as Gifski; keep GIFs under about 10 MB (shorten, or lower the frame rate), and for LinkedIn upload the MP4 itself rather than a GIF.
