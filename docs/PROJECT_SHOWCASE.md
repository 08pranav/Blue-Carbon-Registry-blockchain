# Blue Carbon Registry: project showcase brief

**Purpose of this file.** A fact-checked brief about my project, for me to keep and to give to an AI (or a person) who will write LinkedIn posts, a portfolio entry or interview answers. Everything below comes from the code, the git history, or commands I ran (listed in section 10). Where something is a general claim about the world and not about my code, it is marked **verify before posting**.

Written in first person, as my project. Measurements were taken on 2026-11-06 on the branch merged by [PR #3](https://github.com/08pranav/Blue-Carbon-Registry-blockchain/pull/3).

---

## 1. One-liner and elevator pitch

**One-liner:** A blockchain registry and marketplace where NGOs submit coastal-restoration projects with photo evidence, auditors approve them and issue ERC-20 carbon credits, and companies buy those credits with ETH, all on the Sepolia test network.

**Elevator pitch (3 sentences):**
Blue carbon credits come from restoring mangroves, seagrass and salt marshes, but it is hard for an outsider to see who issued a credit and where it went. I built a full-stack app where every credit is an ERC-20 token that can only be issued by an auditor's on-chain transaction, and every sale is a public smart-contract trade that pays the NGO and delivers the credits in one step. It has a React frontend, an Express backend that does rule-based screening of uploaded photos, Solidity contracts with tests, and CI.

---

## 2. The problem

**Blue carbon.** "Blue carbon" is carbon stored by coastal and marine ecosystems, mainly mangroves, seagrass meadows and salt marshes. Projects that restore these habitats can earn carbon credits, which companies buy to offset emissions.

**Claims about the world (all: verify before posting, with a source):**
- Coastal blue-carbon ecosystems are often described as storing carbon faster per hectare than many land forests. *Verify before posting.* Possible sources to search for: IPCC wetlands supplement, Blue Carbon Initiative (Conservation International / IUCN / UNESCO-IOC).
- Mangroves, seagrass and salt marshes are under pressure from development and aquaculture. *Verify before posting.*
- Carbon-credit registries have been criticised for limited transparency and for credits that overstate real climate benefit (double counting, weak monitoring). *Verify before posting*; cite a specific report rather than a general claim.

**What the project actually targets (design intent, not a measured result):**

| Problem in traditional registries | What the app does about it |
|---|---|
| Hard to see who issued a credit | Credits are minted only by `Marketplace.verifyNGO()`, which only the auditor (Marketplace admin) can call; each issuance emits a public `CreditsMinted` event |
| Double counting | A credit is a fungible ERC-20 balance in exactly one wallet; the same unit cannot be held in two wallets |
| Slow, trust-based settlement | `executeTrade` moves the credits and the ETH payment in one atomic transaction |
| Unchecked evidence | Uploaded photos get a rule-based pre-check before a human auditor decides (section 6) |

**Why blockchain here.** A public chain gives an append-only record that outsiders can verify without trusting the registry's own database. It does not by itself prove the restoration is real: that still depends on the auditor and the evidence, which is why the app keeps a human in the loop.

---

## 3. What I built

### Three roles
| Role | What they do in the app |
|---|---|
| **NGO** | Registers on-chain (optional), submits a project with location, coordinates, ecosystem and photos, sees the screening report, sets how many credits to sell and at what ETH price, and approves the Marketplace to move their credits |
| **Auditor** | Reviews pending projects with the photos and screening report, then approves (issuing BCC on-chain) or rejects |
| **Company** | Browses listings from the backend and buys credits with ETH through MetaMask |

Roles are demo logins (a role picker with fixed wallets), not real authentication (section 12).

### End-to-end flow
1. NGO logs in (`/login` → "Login as NGO"), connects MetaMask, and optionally clicks "Register NGO on Blockchain" (`Marketplace.registerNGO`).
2. NGO opens "Submit New Project", fills in the form and attaches JPEG/PNG photos. The browser uploads to `POST /api/projects`.
3. The backend runs `aiReviewEvidence` on the photos and stores the project as `PENDING` with the screening report.
4. Auditor logs in, connects the auditor wallet, opens the project in "Pending Review", looks at the photos and report.
5. Auditor clicks "Approve & Issue BCC". The app sends `Marketplace.verifyNGO(ngoId, Verified, amount)` (preceded by `registerNGO` if the NGO has no on-chain record). The Marketplace mints BCC to the NGO.
6. The app then calls `PATCH /api/projects/:id/status` with the transaction hash. The backend marks the project `VERIFIED` and creates a marketplace listing at a default price of 0.001 ETH per credit.
7. NGO sees the BCC balance in "Manage Credits", can change the listing's quantity and price, and clicks "Approve" in "Approve Credits for On-Chain Sale" (an ERC-20 `approve` for the Marketplace).
8. Company sees the listing, enters a quantity, clicks "Buy Credits". The app calls `Marketplace.executeTrade(seller, buyer, amount, pdfHash)` with ETH attached. The contract pulls the credits from the NGO with `transferFrom` and forwards the ETH to the NGO.
9. The app records the sale in the backend with the transaction hash, which reduces the listing.

---

## 4. Architecture

```
                         ┌──────────────────────────────────────────────┐
                         │                 Browser                      │
                         │  React 18 + TypeScript + Vite SPA            │
                         │  pages: Login, NGO / Auditor / Company       │
                         │  src/lib/api.ts          src/utils/Token-    │
                         │  (typed REST client)     TransferService.ts  │
                         └───────┬───────────────────────┬──────────────┘
                   same-origin   │                       │  ethers v6 (BrowserProvider)
                   /api, /uploads│                       │  signed by MetaMask
                                 ▼                       ▼
        ┌─────────────────────────────────┐     ┌────────────────────────────────────┐
        │ Express backend (backend/app.js)│     │   Ethereum Sepolia testnet         │
        │ - projects + uploads (multer)   │     │                                    │
        │ - aiReviewEvidence (exifr,      │     │  Marketplace.sol  ──owns──▶        │
        │   image-size, sharp)            │     │   registerNGO / verifyNGO /        │
        │ - listings, purchases           │     │   registerCompany / executeTrade   │
        │ - in-memory store               │     │         │ mint / transferFrom      │
        │ Dev: node server.js (:3001)     │     │         ▼                          │
        │ Vercel: `backend` service       │     │  CarbonCreditToken.sol (ERC-20 BCC)│
        └─────────────────────────────────┘     └────────────────────────────────────┘
            ▲ read-only balances: public RPC (ethers JsonRpcProvider) from the browser
```

**Components**
- **Frontend** (`src/`): React 18, TypeScript, Vite, Tailwind, shadcn/ui, React Router. Dashboards are lazy-loaded. `src/utils/TokenTransferService.ts` holds the wallet logic (issue, approve, buy, balances). `src/lib/api.ts` is the backend client.
- **Backend** (`backend/app.js`, started by `backend/server.js`): Express API with in-memory storage. Also deployed as the `backend` service in the Vercel multi-service config (`vercel.json`).
- **Contracts** (`blockchain-deployment/`): two Solidity contracts, Hardhat tests, deploy scripts.
- **Config:** `src/utils/fixedWallets.ts` (role wallets, env-overridable), `src/blockchain-integration/config.ts` (networks, addresses, ABIs).
- **Deploy:** Vercel (SPA + function) or Docker (nginx + backend).

**How data moves**
- *Project data and photos:* browser → `/api` → Express (in memory, photos on disk).
- *Credits and money:* browser → MetaMask → contracts on Sepolia. The backend never holds keys or moves funds.
- *Sync between the two:* the app passes the on-chain transaction hash to the backend after the transaction confirms. The backend trusts the client-reported hash (it does not read the chain), so the chain is the source of truth for balances and the backend is only a convenience index.
- *Balances* shown in dashboards are read straight from a public RPC, so they do not need a wallet connection.

---

## 5. Smart contracts

Source: `blockchain-deployment/contracts/` (Solidity 0.8.20, OpenZeppelin 5).

### CarbonCreditToken (`BCC`, 18 decimals)
- `constructor(address initialOwner)`: `ERC20("Blue Carbon Credit", "BCC")`, `Ownable`. No initial supply.
- `mint(address to, uint256 amount)`: **onlyOwner**.
- `burn(uint256 amount)`: any holder burns their own tokens (retiring credits).
- Inherited: standard ERC-20 (`transfer`, `approve`, `transferFrom`, `balanceOf`, …), `owner`, `transferOwnership`, `renounceOwnership`. Events: `Transfer`, `Approval`, `OwnershipTransferred`.

### Marketplace
- State: `admin`, `token`, counters `nextNgoId`, `nextCompanyId`, `nextTradeId`; mappings for NGOs, companies, trades.
- `constructor(address tokenAddress)`: sets `admin = msg.sender` (the deployer, i.e. the auditor wallet).
- `registerNGO(wallet, name, documentsHash)`: **anyone**, once per wallet; creates a `Pending` NGO record. Event `NGORegistered`.
- `verifyNGO(ngoId, status, creditsToAllocate)`: **onlyAdmin**. Status must be `Verified` or `Rejected`. If `Verified` and credits > 0, it adds to `creditsAllocated` and **calls `token.mint`** to the NGO's wallet. Events `CreditsMinted` (when minting) and `NGOStatusUpdated`.
- `registerCompany(wallet, name, kycHash)`: anyone, once per wallet. Event `CompanyRegistered`.
- `executeTrade(seller, buyer, amount, pdfHash)`: **payable, anyone can call**. Requires `msg.value > 0` and `amount > 0`; does `token.transferFrom(seller, buyer, amount)` (so the seller must have approved the Marketplace) and forwards the ETH to the seller; records a `Trade`. Event `TradeExecuted(tradeId, seller, buyer, amount, price, pdfHash)`.
- `setAdmin(newAdmin)`: onlyAdmin. Views: `getNgoById`, `getCompanyById`, `getTradeById`.

### Ownership design
The Marketplace **owns** the token (`Token.owner() == Marketplace`). So the only way to create BCC is `verifyNGO`, which only the admin can call. I chose this over letting the auditor wallet call `mint()` directly because (a) it matches the live Sepolia deployment, which I checked with a read-only script, (b) every issuance then updates the registry's `creditsAllocated` and emits `CreditsMinted`, and (c) there is no second path that bypasses the registry. The deploy scripts call `transferOwnership(marketplace)` through a shared `deployCore()` that the tests also use.

### Live deployment (Sepolia)
| Contract | Address | Etherscan |
|---|---|---|
| CarbonCreditToken (BCC) | `0x025614e8Dc0b1eb488604D6f6C85982b85f9665B` | https://sepolia.etherscan.io/address/0x025614e8Dc0b1eb488604D6f6C85982b85f9665B |
| Marketplace | `0x4510c03bAb31E60fd99839A6eA3685f83dd3479D` | https://sepolia.etherscan.io/address/0x4510c03bAb31E60fd99839A6eA3685f83dd3479D |

State I read on 2026-11-06 with `node scripts/check-sepolia.mjs`: both have code; `Token.owner()` is the Marketplace; `Marketplace.admin()` is `0x179d59195f5771E907463986bCE98B0369e52837`; one NGO registered and verified; total supply is a tiny test amount (2000 base units, about 2×10⁻¹⁵ BCC); **zero trades so far** (`nextTradeId` is 1). The deployment dates from 2025-09-29 (`deployments/sepolia.json`).

### Why ERC-20 for credits
- Credits are interchangeable units, which is what ERC-20 models; MetaMask, Etherscan and every wallet already understand it, so balances, transfers and holder lists work with no extra code.
- `approve` / `transferFrom` gives a clean "seller authorises the marketplace to sell up to N" pattern.
- **Trade-off, being honest:** a fungible token loses per-project and per-vintage identity (all BCC look the same), whereas real registries often track batches or serials, which an ERC-1155 or NFT design could keep. 1 BCC is also not tied to a defined tonne of CO₂ in this demo.

---

## 6. Evidence screening: exactly what `aiReviewEvidence` does

It is **rule-based, not machine learning**. The function is in `backend/app.js` and returns `APPROVE`, `NEEDS_REVIEW` or `REJECT` plus a per-photo report. A human auditor makes the real decision. For each uploaded photo:

| Check | Rule | Effect |
|---|---|---|
| File type | MIME type must be jpeg/jpg/png | +1 score, else flagged "Unsupported file type" |
| File size | At least 30 KB | +1 score, else flagged "Image too small (<30KB)" (also flags > 10 MB) |
| Resolution | At least 800 × 600 pixels (`image-size`) | +1 score, else flagged "Low resolution (WxH)" |
| EXIF GPS distance | If the photo has GPS tags (`exifr`), the great-circle (haversine) distance to the project's coordinates must be at most 1,000 m | +1 score, else flagged "Geo mismatch: EXIF shows X km from project location". **A photo without GPS tags is not checked and not penalised** |
| Filename keyword | Filename contains "mangrove" / "seagrass" / "saltmarsh" matching the chosen ecosystem | a "semantic" signal |
| Vegetation colour | Using `sharp` channel means: green mean > max(red, blue) + 10 **and** green mean > 90 | a "semantic" signal |

Overall status: `REJECT` if at least half the photos have issues; `APPROVE` if every photo passes, the score is at least max(3, 2 × number of photos) and at least one semantic signal fired; otherwise `NEEDS_REVIEW`.

What this does **not** do: it cannot recognise a mangrove, detect edited or reused photos, or prove the photo was taken at the stated time or place (EXIF can be faked or stripped). It is a cheap first filter. The tests exercise it with generated images (a low-resolution image is flagged; a large green noisy image passes the colour check). I would call it "rule-based screening", never "AI verification".

---

## 7. Tech stack and why

| Piece | Version | Why I chose it |
|---|---|---|
| React + TypeScript | React 18.3, TS 5.8 | Familiar component model; types caught real bugs during the cleanup |
| Vite | 5.4 | Fast dev server and build; easy `manualChunks` and dev proxy |
| Tailwind CSS + shadcn/ui (Radix) | Tailwind 3.4 | Fast, consistent UI without writing a design system |
| React Router | 6.30 | Simple client routing and role-based redirects |
| ethers.js | 6.17 | Small, readable API for `BrowserProvider`, contracts and units |
| MetaMask | n/a | The wallet most people already have; standard EIP-1193 provider |
| Express + Multer | Express 4 | Minimal REST API and multipart uploads |
| exifr, image-size, sharp | exifr 7, image-size 1, sharp 0.33 | Read GPS tags, dimensions, and pixel statistics for the screening |
| Solidity + OpenZeppelin | 0.8.20, OZ 5 | Audited, standard ERC-20 and `Ownable` rather than hand-rolled token code |
| Hardhat | 2.22 | Local chain, fast contract tests, deploy scripts |
| Vitest + Testing Library | Vitest 3.2 | Same toolchain as Vite; component and unit tests |
| `node:test` | built in (Node 20) | API tests with no extra dependency |
| GitHub Actions | n/a | Lint, typecheck, tests and build on every PR |
| Vercel / Docker (nginx) | n/a | Two ways to run it: serverless demo or containers |
| Sepolia | chain ID 11155111 | Free test ETH; no real money at risk |

---

## 8. Engineering challenges and how I solved them

Each entry: symptom → root cause → fix → lesson. Sources: the first merged PR ([PR #2](https://github.com/08pranav/Blue-Carbon-Registry-blockchain/pull/2), which replaced #1) and [PR #3](https://github.com/08pranav/Blue-Carbon-Registry-blockchain/pull/3).

1. **The project would not build.**
   - *Symptom:* `npm run build` failed to resolve `ethers`.
   - *Root cause:* the code imported `ethers` but it was missing from `package.json`.
   - *Fix:* added the dependency; the build passed.
   - *Lesson:* run a clean install and build in CI, because "works on my machine" hides missing dependencies.

2. **A corrupted service file.**
   - *Symptom:* `TokenTransferService.ts` was broken.
   - *Root cause:* a pasted block had corrupted `initialize()`.
   - *Fix:* repaired the file.
   - *Lesson:* a type check and a test touching the file would have caught it immediately.

3. **The trade ran twice.**
   - *Symptom:* the marketplace trade was executed twice, with a broken fallback after it.
   - *Root cause:* a broken fallback path in the purchase code (per the commit message: "the marketplace trade was executed twice with a broken fallback").
   - *Fix:* removed the duplicate path so a purchase sends one transaction.
   - *Lesson:* anything that moves money must run exactly once; fallbacks that retry silently are dangerous.

4. **Every purchase reverted (approve / transferFrom).**
   - *Symptom:* buying credits always failed.
   - *Root cause:* `Marketplace.executeTrade` moves tokens with `transferFrom`, but nothing let the NGO approve the Marketplace.
   - *Fix:* added `approveMarketplace()` in the service, an allowance check before buying that gives a clear message, and an "Approve Credits for On-Chain Sale" card in the NGO dashboard. A contract test covers the `ERC20InsufficientAllowance` revert.
   - *Lesson:* with ERC-20 you need to think through both sides of `transferFrom`: who approves, and when.

5. **An invalid wallet address.**
   - *Symptom:* the Company demo account could not transact.
   - *Root cause:* the hardcoded Company address contained the letter `H`, which is not a hex character.
   - *Fix:* accounts now come from one `FIXED_WALLETS` module, and tests assert every address is valid.
   - *Lesson:* keep a single source of truth for constants, and validate them in a test.

6. **Credits could not be minted the way the contracts said.**
   - *Symptom:* `Marketplace.verifyNGO()` calls `token.mint()`, but the deploy script left token ownership with the deployer, so minting on verify would revert. The app worked around it by minting straight from the auditor wallet.
   - *Root cause:* the contract design and the deploy script disagreed. Reading the live Sepolia contracts showed `Token.owner()` was already the Marketplace, so the direct-mint workaround would also have reverted there.
   - *Fix:* I made the Marketplace the owner (deploy scripts call `transferOwnership` via a shared `deployCore()` that the tests also use), routed the auditor's approval through `verifyNGO`, and added tests. I also removed a fallback that quietly produced fake transaction hashes when a real transaction failed, because it had been hiding this very error.
   - *Lesson:* check the deployed state, not just the source; and never let a fallback pretend a failed transaction succeeded.

7. **Type and lint debt.**
   - *Symptom:* `npm run typecheck` reported 50 errors and `npm run lint` 145 problems (117 errors), so both had been switched off in CI.
   - *Root cause:* most errors were in pages the router never reached.
   - *Fix:* I found unreachable files with `madge` starting from `src/main.tsx` and deleted 86 of them, then fixed the real errors in the rest (typed `window.ethereum`, `unknown` plus helpers instead of `catch (e: any)`) and re-enabled both checks in CI. Both now report zero errors.
   - *Lesson:* delete dead code before fixing it; use a tool to prove it is dead.

8. **A large bundle.**
   - *Symptom:* the main JS chunk was 789 kB and the build warned about it.
   - *Fix:* lazy-loaded the dashboards with `React.lazy` and added `manualChunks` for ethers, React, router and the UI kit. The largest chunk is now 273 kB and the warning is gone. `wagmi`, `viem` and `recharts` turned out to be imported only by dead pages, so I removed them (and 33 other unused packages) instead of splitting them.
   - *Lesson:* measure what is really in the bundle before optimising it. Note ethers is still part of the initial load because the wallet provider wraps the app.

9. **The "real" data was fake.**
   - *Symptom:* the Company dashboard showed two hardcoded listings; projects lived in `localStorage`; the photo-screening code on the backend was never called; the listings API returned random prices.
   - *Fix:* moved projects, photo upload, listings and sales to the backend with tests, so approving a project creates a listing and a purchase is recorded against its on-chain transaction hash.
   - *Lesson:* check that features are actually wired end to end, not just present in the repo.

---

## 9. Testing and quality

| Suite | Count | What it covers |
|---|---|---|
| Contracts (Hardhat + Chai) | 14 | Token metadata; Marketplace owns the token; direct `mint` reverts for everyone; burn; NGO registration and duplicate block; admin-only verify; minting on verify and `creditsAllocated`; re-verification adds credits; rejection mints nothing; admin handover; company registration; trades (BCC to buyer, ETH to seller); revert on missing allowance, missing payment, zero amount |
| Backend API (`node:test`) | 7 | Starting state; input validation; screening flags a low-resolution photo; screening passes a large green photo; NGOs see only their projects; approve → listing → NGO edit → purchase with all the failure cases; sell-out removes the listing |
| Frontend (Vitest) | 15 | Wallet addresses and env overrides; role login; API client; Company dashboard shows API listings, buys through the contract call and records the sale with the tx hash, and does not record when the purchase fails |
| Local-chain end-to-end (opt-in) | 5 | `npm run test:e2e-local` runs the app's real wallet code against a Hardhat node: wrong-wallet refusal, issuing BCC through `verifyNGO`, buying blocked without allowance, approve then buy with balance and event checks |

Total: **41** tests (14 + 7 + 15 + 5). The 5 end-to-end tests are skipped in normal runs because they start a local node.

**CI** (`.github/workflows/ci.yml`, GitHub Actions, Node 20): a frontend job runs `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test:ci`, `npm run build`, then installs the backend and runs its tests; a contracts job runs `npx hardhat test`.

I also ran the whole NGO → Auditor → Company flow by hand in a real browser against a local Hardhat chain, using a stand-in wallet instead of MetaMask, and ran `docker compose up --build` to check both containers become healthy.

---

## 10. Measured numbers (and the commands)

All from the repo root on 2026-11-06. "Before" means the original `main` just after the first PR (commit `d67940d`); "after" means the merged work in PR #3.

| Measure | Result | How I measured it |
|---|---|---|
| Frontend app code | 3,714 lines (TS/TSX, excluding tests and `components/ui`) | `git ls-files 'src/*.ts' 'src/*.tsx' \| grep -v -e '^src/test/' -e 'components/ui/' \| xargs cat \| wc -l` |
| shadcn UI kit | 405 lines | same, for `src/components/ui` |
| Frontend tests | 482 lines | `git ls-files src/test \| xargs cat \| wc -l` |
| Backend | 738 lines (`app.js` + `server.js`); 153 lines of tests | `cat backend/app.js backend/server.js \| wc -l` |
| Smart contracts | 2 contracts, 181 lines of Solidity | `git ls-files 'blockchain-deployment/contracts/*.sol' \| xargs cat \| wc -l` |
| Contract tests | 139 lines | `wc -l blockchain-deployment/test/BlueCarbon.test.cjs` |
| Deploy/utility scripts | 673 lines | `git ls-files blockchain-deployment/scripts \| xargs cat \| wc -l` |
| Tests | 41 total (14 contract, 7 API, 15 frontend, 5 local-chain e2e) | `npx hardhat test`, `cd backend && npm test`, `npm run test:ci`, `npm run test:e2e-local` |
| TypeScript errors | **50 → 0** | `npm run typecheck` (before: a clean install of commit `d67940d`) |
| Lint | **145 problems (117 errors) → 0 errors** | `npm run lint` |
| Largest JS chunk | **789.00 kB → 273.33 kB** (gzip 240.83 → 100.39 kB), build warning gone | `npm run build`; before: clean install of `d67940d` |
| Initial page JS (after) | about 646 kB across 5 chunks (index 134.5, react 164.7, ethers 273.3, ui 51.2, router 22.2); I did not measure the initial load before the change | sizes printed by `npm run build` |
| Files removed by cleanup | **86** unreachable source files in `src/`; **109** files deleted and 14 added in PR #3 overall (163 files changed) | `git diff --name-status d67940d..HEAD`; unreachable files from `madge --json --ts-config tsconfig.app.json src/main.tsx` |
| Cleanup in the first PR | 55 files deleted and 24 old notes moved to `docs/archive/` (95 files changed) | `git show --shortstat d67940d` |
| Dependencies removed | 36 unused runtime packages (including `wagmi`, `viem`, `recharts`) | `npx depcheck`, then `npm uninstall` |
| `npm audit` (root) | 28 → 21 findings (the 28 is after pruning unused packages; I did not audit the original lockfile) (1 high, 2 critical, 18 moderate remaining; all need major upgrades) | `npm audit` before and after `npm audit fix` |
| `npm audit` (backend) | 10 → 2 (both high: `sharp` major upgrade; `image-size` parser issues) | same |
| `npm audit` (blockchain-deployment) | 60 → 49 (Hardhat toolchain; fixes need Hardhat 3) | same |
| Gas (local chain) | `verifyNGO` 135,874; `approve` 46,406; `executeTrade` 237,957 | Hardhat node log |
| Git history | 38 commits on `main` before PR #3, first commit 2025-09-26 | `git rev-list --count origin/main` |

The `npm audit` leftovers are mostly development tooling (Vite/Vitest/Hardhat) and one runtime library, `react-router`; I applied only non-breaking fixes.

---

## 11. Skills demonstrated

Copy-ready:
- Solidity smart contracts (ERC-20, access control with OpenZeppelin `Ownable`, events)
- Smart-contract testing with Hardhat and Chai
- Ethereum dApp integration with ethers.js v6 and MetaMask (EIP-1193)
- Deploying to and inspecting a public testnet (Sepolia, Etherscan)
- React 18 and TypeScript front-end development
- Vite build optimisation (code splitting, `manualChunks`, lazy loading)
- Node.js and Express REST API design, file uploads (Multer)
- Image-metadata processing (EXIF GPS, resolution, pixel statistics) with exifr, image-size, sharp
- Unit, API and integration testing (Vitest, Testing Library, `node:test`)
- CI with GitHub Actions (lint, type-check, test, build)
- Static analysis and dead-code removal (`madge`, `depcheck`, TypeScript strict-style cleanup)
- Dependency vulnerability triage (`npm audit`)
- Docker, nginx reverse proxy, Vercel serverless deployment
- Debugging contract/application mismatches by reading on-chain state
- Technical writing (README, user-testing guide)

---

## 12. Limitations and roadmap (be honest about these)

**Limitations**
- **Testnet only.** Sepolia test ETH has no value. No real credits, no real money.
- **Demo logins.** The role pages are a role picker with fixed wallets and `localStorage`, not authentication. Anyone can open any role. The wallet check only compares the connected MetaMask address with the role's expected address.
- **In-memory backend.** Projects, listings and sales vanish when the server restarts. On Vercel's serverless functions each instance has its own memory and its own `/tmp`, so a hosted demo can lose data and photos; request bodies are also limited to 4.5 MB.
- **Backend trusts the client** for the purchase transaction hash; it does not verify the transaction on chain.
- **Price is not enforced on chain.** `executeTrade` takes whatever ETH the caller sends and anyone can call it, so the listing price lives only in the backend. The NGO's `approve` amount is the only on-chain cap.
- **Contracts are not audited.** Known gaps I have not fixed: `executeTrade` writes state after sending ETH (no reentrancy guard), the NGO "verification" is a single admin key, and `registerNGO` is open to anyone for any wallet.
- **Fungible credits.** BCC does not carry project/vintage identity and is not tied to a measured tonne of CO₂.
- **Screening is heuristic** (section 6). Photos without GPS tags are not location-checked.
- **Dependencies:** known `npm audit` findings remain (section 10).
- The live Sepolia deployment has never completed a trade as of the check above.

**Roadmap** (ideas, not promises)
- A database and object storage for projects and photos
- Real wallet-based sign-in (Sign-In with Ethereum) and a multisig or role-based auditor
- Enforce price and slippage on chain; add a reentrancy guard; a professional audit
- Verify purchase transactions on the backend by reading the receipt
- Credit retirement certificates (burn → record)
- Project-level token identity (ERC-1155 or NFTs)
- A public explorer built from contract events

---

## 13. Links

- Repository: https://github.com/08pranav/Blue-Carbon-Registry-blockchain
- Pull requests: [#1](https://github.com/08pranav/Blue-Carbon-Registry-blockchain/pull/1) (closed, superseded), [#2](https://github.com/08pranav/Blue-Carbon-Registry-blockchain/pull/2) (first working version, merged), [#3](https://github.com/08pranav/Blue-Carbon-Registry-blockchain/pull/3) (ownership design, real data, cleanup, docs)
- Contracts on Etherscan: [CarbonCreditToken](https://sepolia.etherscan.io/address/0x025614e8Dc0b1eb488604D6f6C85982b85f9665B), [Marketplace](https://sepolia.etherscan.io/address/0x4510c03bAb31E60fd99839A6eA3685f83dd3479D)
- Live demo: **placeholder, add your Vercel URL here after deploying** (see the README, "Deploy to Vercel")
- How to test with MetaMask: [`docs/TESTING_WITH_METAMASK.md`](TESTING_WITH_METAMASK.md)
- Screenshots in `docs/screenshots/` (note: these were taken before the backend-driven dashboards, so retake the NGO, Auditor and Company shots for a post):

| File | Suggested caption |
|---|---|
| `home.png` | "The landing page: pick a role and try the flow on Sepolia." |
| `ngo.png` | "NGO dashboard: submit a coastal restoration project and manage credits." |
| `auditor.png` | "Auditor dashboard: review evidence, then issue credits on-chain." |
| `company.png` | "Company dashboard: buy verified credits with ETH." |

---

## 14. Ready-to-use LinkedIn material

### 14.1 Five hooks
1. **Problem-first:** "You can't easily check who issued a carbon credit or where it went. I tried to build a version where you can."
2. **Story / bug-first:** "Every purchase in my carbon-credit app failed for days. The bug was one missing line: the seller never approved the marketplace."
3. **Result-first:** "I took a project from 50 TypeScript errors to 0, and a 789 kB bundle down to 273 kB."
4. **Contrarian:** "A blockchain does not make a carbon credit trustworthy. Here is what it can and can't do."
5. **Question:** "What happens when the contract that mints your tokens isn't the one allowed to mint them?"

### 14.2 Three post drafts

**A. Technical deep-dive (213 words)**

My carbon-credit dApp had a bug I only found by reading the live contracts.

The idea: NGOs submit coastal restoration projects, an auditor approves them, and approval mints ERC-20 credits. In my code, the Marketplace contract's verifyNGO() calls token.mint(). But the deploy script left token ownership with my wallet, so that call would revert. The app hid it by minting straight from the auditor's wallet.

When I queried the Sepolia deployment with a small read-only script, the token owner was already the Marketplace. So the direct mint would have failed there too.

The fix:
- the Marketplace owns the token
- the only way to issue credits is verifyNGO(), callable only by the admin
- one shared deployCore() function used by both the deploy scripts and the tests
- I removed a fallback that quietly produced fake transaction hashes when real ones failed

Now 14 contract tests cover it, and a local-chain test drives the real frontend wallet code end to end.

Lesson: check what is actually deployed, not only what the source says. And never let a fallback pretend a failed transaction worked.

It's a testnet demo with an in-memory backend, not a production registry.

Code and a MetaMask test guide are in the repo (link in comments).

#Solidity #Ethereum #SmartContracts #Hardhat #WebDev

**B. Learning journey (189 words)**

I wanted to understand how blockchain could make carbon credits easier to check, so I built a small registry.

NGOs submit mangrove or seagrass restoration projects with photos. An auditor reviews them and issues ERC-20 credits. A company buys credits with test ETH on Sepolia.

What I learned along the way:
- Missing dependency: my first build failed because ethers wasn't in package.json.
- ERC-20 approvals: every purchase reverted until I understood that the seller must approve the marketplace before transferFrom works.
- Dead code: 86 files nothing imported. Deleting them cut my TypeScript errors from 50 to 0.
- Fake data: my "marketplace" was two hardcoded listings. I moved it to a real backend.

I also learned to be honest about limits. The photo check is just rules (resolution, GPS distance, a green-colour heuristic), not AI. The backend is in memory. It's testnet only.

I'm early in my career and this taught me more than any tutorial did, mostly because I had to fix things that were broken.

If you work in climate tech or web3, I'd love to hear what you'd improve first.

#BuildInPublic #Blockchain #React #LearningInPublic #ClimateTech

**C. Short, impact-focused (about 155 words)**

I built a carbon-credit registry on the Sepolia testnet.

NGOs submit coastal restoration projects with photos. An auditor approves them and issues credits on-chain. A company buys those credits with ETH, and the NGO is paid in the same transaction.

What's in it:
- React and TypeScript frontend, Express backend, two Solidity contracts
- 41 automated tests and CI on every pull request
- Photo pre-checks: resolution, GPS distance and a vegetation-colour test

Along the way I cut the main JavaScript chunk from 789 kB to 273 kB and took TypeScript errors from 50 to 0.

It's a learning project: testnet only, demo logins, an in-memory backend and no audit. But it showed me how much of a real product is the unglamorous part, like tests, deployment and honest documentation. That part took longer than the contracts did.

Repo and a step-by-step MetaMask guide are linked below.

#Web3 #ClimateTech #Ethereum #React

### 14.3 Carousel (7 slides)
1. **Title:** "I built a carbon-credit registry on Ethereum (testnet)". Subtitle: mangroves, seagrass, salt marshes.
2. **The problem:** Hard to see who issued a credit and where it went. (Mark any statistic as verify-before-posting.)
3. **The flow:** NGO submits with photos → Auditor approves → credits issued on-chain → Company buys with ETH.
4. **Under the hood:** React + TypeScript, Express, 2 Solidity contracts, ethers.js, MetaMask.
5. **A bug I'm glad I found:** The contract that mints tokens wasn't allowed to mint. Fix: the Marketplace owns the token.
6. **Numbers I measured:** 41 tests · 50 → 0 TypeScript errors · 789 → 273 kB largest chunk.
7. **Honest limits + link:** Testnet only, demo logins, in-memory backend, rule-based photo checks. Repo link.

### 14.4 Instructions for the AI writing my post
- **Voice:** I'm a student / early-career developer. Excited but grounded. Plain, human language, first person, short sentences. No buzzword stacking ("revolutionary", "game-changing", "leveraging", "seamless").
- **Don't overclaim.** Always make clear it is a **testnet demo** with demo role logins and an in-memory backend. Never say it "solves" carbon-market problems, is "production-ready", "secure" or "audited". Describe the photo check as **rule-based screening**, not "AI verification".
- **Use only facts from this file.** Do not invent users, revenue, partners, adoption or statistics. Any claim about blue carbon in the real world needs a source or should be left out.
- **Include exactly one specific technical lesson** (for example: the approve/`transferFrom` bug, or "check what's actually deployed, not just the source") and explain it in two or three sentences.
- **Format:** short paragraphs, one idea per line, 150–250 words for a standard post, 3–5 relevant hashtags at the end, a repo link in the first comment rather than the body. No emoji walls (at most one or two).
- Offer one question at the end to invite discussion, but don't beg for engagement.

---

## 15. FAQ

**Is this real money or real carbon credits?** No. It runs on the Sepolia test network with free test ETH. BCC tokens are demo tokens with no real-world carbon value.

**Is it live? Can I try it?** The contracts are live on Sepolia. A hosted web demo is not set up yet (placeholder in the README). You can run it locally in a few minutes; see `docs/TESTING_WITH_METAMASK.md`.

**Is the photo check AI?** No. It is rule-based: file type and size, resolution, distance between the photo's GPS tags and the project's location, and a simple "is it mostly green" test. A human auditor decides.

**Can people fake the evidence?** Yes, easily: EXIF data can be edited or removed, and photos can be reused. The check only filters obvious problems. Real verification would need field audits, satellite data and so on.

**Why ERC-20 and not NFTs?** Credits are interchangeable units, and ERC-20 works with every wallet and explorer out of the box. The downside is losing per-project identity; an ERC-1155 or NFT design could keep it.

**Why does the Marketplace own the token?** So the only way to create credits is the auditor-only `verifyNGO` function, which updates the registry and emits an event. It also matches how the live deployment is set up.

**Who decides how many credits a project gets?** The auditor types the number when approving. The app does not compute carbon from area or ecosystem.

**How is the price set?** The backend creates a listing at 0.001 ETH per credit on approval, and the NGO can change it. The contract does not enforce the price: it accepts whatever ETH the buyer sends. That is a known limitation.

**Is the login secure?** No. It is a demo role picker. Real sign-in (Sign-In with Ethereum) is on the roadmap.

**Where is the data stored?** Credit balances and trades are on chain. Projects, photos and listings are in the backend's memory and disappear on restart.

**Has it been audited?** No. Don't use these contracts with real funds.

**What was the hardest bug?** The contract/deployment mismatch around who may mint (section 8, item 6), and the approve/`transferFrom` bug that made every purchase fail (item 4).

**What would you do next?** A database, real authentication, on-chain price enforcement with a reentrancy guard, and verifying purchases from the transaction receipt.

**How is it tested?** 41 automated tests (14 contract, 7 API, 15 frontend, 5 opt-in local-chain end-to-end), with CI running lint, type-check, tests and build on every pull request.

**Did you build it alone?** The repository was started by me and a collaborator contributed earlier commits (see the git history for authors); the work described here is the part I did after that. *(Edit this answer to match how you want to describe it.)*

**Which part are you proudest of?** The honest cleanup: finding that "mock" parts were hiding real bugs, and replacing them with tested code.
