# Field map for the demo

Produced by `node demo/discover.cjs` (Phase 1) against the running app (`demo/stack.sh start`). The raw dump is written to `demo/.run/discovery.json`. Everything below is what the current UI actually contains. No console errors were logged while walking the whole flow.

Notes that affect scripting:
- **Two "Logout" buttons** exist once logged in (header and dashboard). Use the header one: `getByRole('navigation').getByRole('button', { name: 'Logout' })`.
- **Tabs** are Radix tabs: `button[role="tab"]` (`getByRole('tab', { name })`).
- The app reports transaction results with native `alert()` / `confirm()`. Video does not capture native dialogs, so `lib.cjs` replaces them with an in-page dialog box that shows the app's real message text (confirm is auto-accepted).
- Wallet: the stand-in `window.ethereum` in `lib.cjs` signs on the local Hardhat chain. The selected account follows the logged-in role (Hardhat #0 Auditor, #1 NGO, #2 Company).
- The Ecosystem field is a native `<select>` with options Mangrove / Seagrass / Salt marsh (values `MANGROVE`, `SEAGRASS`, `SALT_MARSH`).
- Auditor project cards are `<button>`s; the visible text is the project title followed by the screening badge (for example `APPROVE`).

---

## `/` (home)
| Element | Selector / text |
|---|---|
| Hero heading | `h1` "🌊 Blue Carbon Credits System" |
| Role cards | `h3` "🏛️ For NGOs", "🛡️ For Auditors", "🏢 For Companies" |
| Status box | `h3` "🚀 System Status" (static text that mentions Sepolia: **not shown in the recording**, it is not tied to the chain in use) |
| Header link to login | `a[href="/login"]` text "Login" (first in the nav) |
| Other links | "Home", "🎭 Try Demo" (`/auth-demo`), "Try NGO Demo" / "Try Auditor Demo" / "Try Company Demo" (`/auth-demo`) |

## `/login`
| Element | Selector / text |
|---|---|
| Heading | `h1` "Blue Carbon Credit System" |
| Role cards | `h3` "NGO Login", "AUDITOR Login", "COMPANY Login" |
| Buttons | `button` "Login as NGO", "Login as AUDITOR", "Login as COMPANY" |
| Result | navigates to `/dashboard` |

## `/dashboard` as NGO
Before connecting: only the header (links Home, Dashboard, Auth Demo; button Logout).
Click `button` "Connect Wallet" → green card `h3` "🔗 Wallet connected" with `ETH: … | BCC: …`.

| Element | Selector / text |
|---|---|
| Title | `h1` "NGO Dashboard", wallet line "Wallet to use in MetaMask: 0x…" |
| Stat cards | "Total Projects", "Verified Projects", "BCC Balance (on-chain)", "Listed for Sale" |
| Optional on-chain step | `button` "Register NGO on Blockchain" (not used in the recording; the auditor's approval registers the NGO) |
| Tabs | `tab` "My Projects", "Submit New Project", "Manage Credits" |

### Submit New Project tab
| Field | Control |
|---|---|
| Project Title | `input[placeholder="e.g., Mangrove Restoration in Goa"]` |
| Project Description | `textarea[placeholder="Describe your project, methods and expected impact"]` |
| Location | `input[placeholder="e.g., Goa, India"]` |
| Ecosystem | `select[aria-label="Ecosystem"]` |
| Latitude | `input[type=number][placeholder="15.3"]` |
| Longitude | `input[type=number][placeholder="73.9"]` |
| Area (hectares) | `input[type=number][placeholder="10"]` |
| Expected Carbon Credits | `input[type=number][placeholder="Estimated number of carbon credits"]` |
| Field photos | `input[type=file][aria-label="Field photos"]` (accepts JPEG/PNG, up to 10) |
| Submit | `button` "Submit Project for Review" |
| After submit | alert "✅ "<title>" submitted for auditor review. … Automated evidence screening: APPROVE"; below the form a grey box "Automated evidence screening: <status>" with one line per photo |

### Manage Credits tab
| Element | Selector / text |
|---|---|
| Balance box | `h3` "BCC in your wallet: N" |
| Per-project listing form | `input[placeholder="Number of credits"]`, `input[placeholder="0.001"]` (ETH price), `button` "List Credits for Sale" |
| On-chain approval | `input[placeholder="BCC amount to approve"]` + `button` "Approve" (exact name; card title "Approve Credits for On-Chain Sale") |
| After Approve | alert "✅ Marketplace approved to sell N BCC. 🔗 <tx hash>" |

## `/dashboard` as Auditor
Click `button` "Connect Wallet" → `h3` "🔗 Auditor wallet connected".

| Element | Selector / text |
|---|---|
| Stat cards | "Total Projects", "Pending Review", "Approved", "BCC Issued" |
| Tabs | `tab` "Pending Review (N)", "Reviewed (N)" |
| Project list | one `button` per project (title + screening badge); two sample projects from the backend are always present |
| Review panel (after clicking a project) | description, NGO wallet, coordinates, photo thumbnails (`a[href^="/uploads/"] > img`), "Automated screening: APPROVE (score 3)" box |
| Credits to issue | the only `input[type=number]` in the review panel (defaults to the NGO's estimate) |
| Audit notes | the review panel `textarea` |
| Approve | `button` "Approve & Issue BCC" (confirm dialog, then `registerNGO` if needed and `verifyNGO`) |
| Reject | `button` "Reject" |
| After approve | alert "✅ N BCC issued to the NGO and the project is approved. 🔗 <tx hash>"; the project moves to the "Reviewed" tab, which shows a "view transaction" link |

## `/dashboard` as Company
No wallet connection is needed to browse (balances are read from the chain).

| Element | Selector / text |
|---|---|
| Title | `h1` "Company Dashboard" |
| Stat cards | "BCC Tokens Owned", "Available for Purchase" (ETH), "Active Listings", "Credits Available" |
| Listings | `h3` "Marketplace Listings"; each listing card shows project name, location, "Price per credit", "Available" |
| Quantity | `input[type=number][aria-label="Quantity for <project name>"]` |
| Buy | `button` "Buy Credits" (MetaMask-style `executeTrade` with ETH attached) |
| After buy | alert "MARKETPLACE TRADE COMPLETE! … Trade TX: <hash>"; a green bar "Last purchase transaction:"; BCC and listing numbers update |
