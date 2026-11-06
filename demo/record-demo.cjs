'use strict';
// Records the NGO -> Auditor -> Company demo of the Blue Carbon Registry (Playwright, 1280x720).
//
//   demo/stack.sh start                 fresh local chain + backend + frontend
//   node demo/record-demo.cjs --rehearse   Phase 2: checks every selector, runs the flow fast, no video
//   node demo/record-demo.cjs --dry        full pacing, no video (confirms the on-chain steps)
//   node demo/record-demo.cjs              Phase 3: records demo/blue-carbon-demo.webm (+ marks for editing)
//
// Transactions are real transactions on the local Hardhat chain, signed by a stand-in wallet
// (see lib.cjs). Each run needs a fresh stack because the flow creates state (re-run stack.sh start).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const L = require('./lib.cjs');

const BASE_URL = process.env.DEMO_BASE_URL || 'http://localhost:8080';
const API_URL = process.env.DEMO_API_URL || 'http://localhost:3001';
const RUN_DIR = path.join(__dirname, '.run');
const VIDEO_DIR = path.join(RUN_DIR, 'video');
const OUTPUT = path.join(__dirname, 'blue-carbon-demo.webm');
const PHOTO = path.join(__dirname, '..', 'public', 'assets', 'hero-mangroves.jpg');
const REHEARSAL = process.argv.includes('--rehearse');
const DRY = process.argv.includes('--dry');
const RECORD = !REHEARSAL && !DRY;
if (REHEARSAL) L.setSpeed(0.05);

const PROJECT = {
  title: 'Sundarbans Mangrove Restoration – Phase II',
  description: 'Replanting 150 hectares of degraded mangrove forest in the Sundarbans delta with community-run nurseries.',
  location: 'Sundarbans, South 24 Parganas, West Bengal, India',
  latitude: '21.9497',
  longitude: '88.2636',
  area: '150',
  credits: '1500',
  photoName: 'sundarbans-mangrove-restoration.jpg',
};
const APPROVE_AMOUNT = '500';
const BUY_QTY = '100';

const marks = []; // { step, subtitle, t } where t = seconds since the video started
let t0 = 0;
const consoleErrors = [];

(async () => {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ...(RECORD ? { recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } } } : {}),
  });
  await L.installStandIns(context);
  const page = await context.newPage();
  t0 = Date.now();
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));

  // ---- helpers bound to this run ---------------------------------------------------------
  let stepNo = 0;
  const step = async (text) => {
    stepNo += 1;
    const subtitle = `Step ${stepNo} – ${text}`;
    marks.push({ step: stepNo, subtitle, t: (Date.now() - t0) / 1000 });
    console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${subtitle}`);
    await L.showSubtitle(page, subtitle);
  };
  // named timestamps used when editing the video (e.g. the highlight cut)
  const note = (name) => marks.push({ note: name, t: (Date.now() - t0) / 1000 });
  const check = async (locator, label) => {
    if (REHEARSAL && !(await L.ensureVisible(page, locator, label))) throw new Error(`REHEARSAL FAILED at "${label}"`);
  };
  const click = async (locator, label, opts) => { await check(locator, label); await L.moveAndClick(page, locator, label, opts); };
  const type = async (locator, text, label, delay) => { await check(locator, label); await L.typeSlowly(page, locator, text, label, delay); };
  const pause = (ms) => L.wait(page, ms);
  const waitForDialog = async (re, label, timeout = 60000) => {
    await page.waitForFunction((src) => new RegExp(src).test(window.__lastDialog || ''), re.source, { timeout }).catch(() => {
      throw new Error(`Timed out waiting for dialog "${label}"`);
    });
    note('dialog: ' + label);
    return L.lastDialog(page);
  };
  const logoutAndLogin = async (roleLabel) => {
    await click(page.getByRole('navigation').getByRole('button', { name: 'Logout' }), 'Header Logout', { postClickDelay: 1200 });
    await page.waitForURL('**/login', { timeout: 10000 });
    await L.overlays(page);
    await click(page.getByRole('button', { name: `Login as ${roleLabel}` }), `Login as ${roleLabel}`, { postClickDelay: 1500 });
    await page.waitForURL('**/dashboard');
    await L.overlays(page);
    await pause(1800);
  };
  const connectWallet = async (headingRe) => {
    // Like MetaMask after the first approval, the stand-in wallet is remembered, so the app may
    // already be connected on later logins: click "Connect Wallet" only when the button is there.
    const connect = page.getByRole('button', { name: 'Connect Wallet' });
    await pause(1200);
    if (await connect.isVisible().catch(() => false)) {
      await click(connect, 'Connect Wallet', { postClickDelay: 800 });
    } else {
      console.log('  (wallet already connected)');
    }
    await page.getByRole('heading', { name: headingRe }).waitFor({ timeout: 20000 });
    await pause(1500);
  };

  // wallets and contract addresses for the real checks at the end
  const accounts = await L.rpcCall('eth_accounts');
  const [auditorAddr, ngoAddr, companyAddr] = accounts;
  const deployment = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'blockchain-deployment', 'deployments', 'localhost.json'), 'utf8'));
  const token = deployment.contracts.CarbonCreditToken.address;
  const health = await (await fetch(`${API_URL}/api/health`)).json();
  assert.strictEqual(health.transactions, 0, 'backend is not fresh: run demo/stack.sh start');
  assert.strictEqual(await L.bccBalance(token, ngoAddr), 0n, 'chain is not fresh: run demo/stack.sh start');

  try {
    // ============ Title card ==========================================================
    await page.goto(`${BASE_URL}/`);
    await L.overlays(page);
    marks.push({ step: 0, subtitle: 'Title card', t: (Date.now() - t0) / 1000 });
    await L.showCard(page, `
      <div style="font-size:20px;letter-spacing:6px;opacity:.75;margin-bottom:22px">🌊 BLUE CARBON REGISTRY</div>
      <div style="font-size:50px;font-weight:700;line-height:1.2;max-width:980px">Blue Carbon Registry:<br>transparent carbon credits for mangroves, seagrass and salt marshes on Ethereum</div>`, 3300);
    await L.hideCard(page);

    // ============ Home ================================================================
    await step('Welcome to the Blue Carbon Registry');
    await check('h1', 'Home hero heading');
    await L.panElements(page, 'h1, h1 + p', 2);
    await pause(1200);
    await check(page.getByRole('heading', { name: /For NGOs/ }), 'For NGOs card');
    await L.smoothScrollTo(page, page.getByRole('heading', { name: /For Auditors/ }), 'For Auditors card', 1600);
    await L.panElements(page, 'h3:has-text("For")', 3);
    await pause(1500);
    await L.smoothScroll(page, 0, 1500);

    // ============ Login: NGO ==========================================================
    await step('Choose a role: NGO, Auditor or Company');
    await click(page.getByRole('navigation').getByRole('link', { name: 'Login', exact: true }), 'Header Login link', { postClickDelay: 1500 });
    await page.waitForURL('**/login');
    await L.overlays(page);
    await check(page.getByRole('heading', { name: 'NGO Login' }), 'NGO Login card');
    await L.panElements(page, 'h3:has-text("Login")', 3);
    await pause(1000);

    await step('NGO logs in and connects its wallet');
    await click(page.getByRole('button', { name: 'Login as NGO' }), 'Login as NGO', { postClickDelay: 1500 });
    await page.waitForURL('**/dashboard');
    await L.overlays(page);
    await pause(2000);
    await connectWallet(/Wallet connected/);
    await L.panElements(page, 'main .text-2xl, .text-2xl.font-bold', 4);

    // ============ NGO submits a project ================================================
    await step('NGO submits a mangrove restoration project');
    await click(page.getByRole('tab', { name: 'Submit New Project' }), 'Tab: Submit New Project');
    await L.smoothScroll(page, 0, 600);
    await type(page.getByPlaceholder('e.g., Mangrove Restoration in Goa'), PROJECT.title, 'Project title');
    await type(page.getByPlaceholder('Describe your project, methods and expected impact'), PROJECT.description, 'Description', 14);
    await type(page.getByPlaceholder('e.g., Goa, India'), PROJECT.location, 'Location', 16);
    await check(page.getByLabel('Ecosystem'), 'Ecosystem select');
    await L.smoothScrollTo(page, page.getByLabel('Ecosystem'), 'Ecosystem select', 1000);
    await L.moveAndClick(page, page.getByLabel('Ecosystem'), 'Ecosystem select', { postClickDelay: 400 });
    await page.getByLabel('Ecosystem').selectOption('MANGROVE');
    await pause(900);
    await type(page.getByPlaceholder('15.3'), PROJECT.latitude, 'Latitude');
    await type(page.getByPlaceholder('73.9'), PROJECT.longitude, 'Longitude');
    await type(page.getByPlaceholder('10', { exact: true }), PROJECT.area, 'Area');
    await type(page.getByPlaceholder('Estimated number of carbon credits'), PROJECT.credits, 'Expected credits');

    await step('Attach a field photo as evidence');
    await check(page.getByLabel('Field photos'), 'Field photos input');
    await L.smoothScrollTo(page, page.getByLabel('Field photos'), 'Field photos input', 1200);
    const chooserPromise = page.waitForEvent('filechooser');
    await L.moveAndClick(page, page.getByLabel('Field photos'), 'Field photos input', { postClickDelay: 300 });
    const chooser = await chooserPromise;
    await chooser.setFiles({ name: PROJECT.photoName, mimeType: 'image/jpeg', buffer: fs.readFileSync(PHOTO) });
    await pause(1000);

    await step('Submit: the photo is screened automatically');
    note('click: submit');
    await click(page.getByRole('button', { name: 'Submit Project for Review' }), 'Submit Project for Review', { postClickDelay: 500 });
    const submitted = await waitForDialog(/submitted for auditor review/, 'project submitted');
    assert(/Automated evidence screening: (APPROVE|NEEDS_REVIEW)/.test(submitted), 'unexpected screening result: ' + submitted);
    await pause(3000);
    await L.hideDialog(page);
    await check(page.getByText('Automated evidence screening:').first(), 'Screening result box');
    await L.smoothScrollTo(page, page.getByText('Automated evidence screening:').first(), 'Screening result box', 1600);
    await pause(3000);

    // ============ Auditor ==============================================================
    await step('Auditor logs in and connects its wallet');
    await L.smoothScroll(page, 0, 700);
    await logoutAndLogin('AUDITOR');
    await connectWallet(/Auditor wallet connected/);

    await step('Auditor opens the pending project and its evidence report');
    const projectBtn = page.getByRole('button', { name: new RegExp(PROJECT.title) }).first();
    await L.panElements(page, '.text-2xl.font-bold', 4);
    await click(projectBtn, 'Pending project card', { postClickDelay: 1500 });
    await check(page.getByText(/Automated screening:/), 'Review panel: screening report');
    await L.smoothScrollTo(page, page.getByText(/Automated screening:/), 'Screening report', 1500);
    await L.panElements(page, 'img[alt$=".jpg"]', 1);
    await pause(3000);
    await type(page.locator('textarea').last(), 'Photo and coordinates match the Sundarbans site. Approved: 1,500 BCC.', 'Audit notes', 14);

    await step('Approve: BCC credits are minted on-chain to the NGO');
    note('click: approve');
    await click(page.getByRole('button', { name: 'Approve & Issue BCC' }), 'Approve & Issue BCC', { postClickDelay: 300 });
    await pause(2000); // let the viewer read the confirmation prompt
    const issued = await waitForDialog(/BCC issued to the NGO/, 'credits issued');
    assert(/0x[0-9a-f]{64}/i.test(issued), 'no tx hash in: ' + issued);
    await pause(4200);
    await L.hideDialog(page);
    await click(page.getByRole('tab', { name: /Reviewed/ }), 'Tab: Reviewed', { postClickDelay: 2500 });
    assert.strictEqual(await L.bccBalance(token, ngoAddr), 1500n * 10n ** 18n, 'NGO should hold 1500 BCC after approval');

    // ============ NGO: balance + approve marketplace ===================================
    await step('NGO now holds the newly minted BCC');
    await logoutAndLogin('NGO');
    await connectWallet(/Wallet connected/);
    await click(page.getByRole('tab', { name: 'Manage Credits' }), 'Tab: Manage Credits', { postClickDelay: 2000 });
    await check(page.getByText(/BCC in your wallet: 1500/), 'BCC balance 1500');
    await L.panElements(page, 'h3:has-text("BCC in your wallet"), h4', 3);
    await pause(2500);

    await step('NGO approves the Marketplace to sell credits');
    await type(page.getByPlaceholder('BCC amount to approve'), APPROVE_AMOUNT, 'Approve amount');
    await click(page.getByRole('button', { name: 'Approve', exact: true }), 'Approve', { postClickDelay: 300 });
    const approved = await waitForDialog(/Marketplace approved to sell/, 'marketplace approved');
    assert(/0x[0-9a-f]{64}/i.test(approved), 'no tx hash in: ' + approved);
    await pause(4000);
    await L.hideDialog(page);
    const ngoEthBefore = await L.ethBalance(ngoAddr);
    const companyEthBefore = await L.ethBalance(companyAddr);

    // ============ Company buys =========================================================
    await step('Company logs in and browses the marketplace');
    await logoutAndLogin('COMPANY');
    await check(page.getByRole('heading', { name: PROJECT.title }), 'Listing card');
    await L.smoothScrollTo(page, page.getByRole('heading', { name: PROJECT.title }), 'Listing card', 1500);
    await L.panElements(page, 'h3:has-text("Sundarbans"), .font-bold.text-lg, .font-semibold', 3);
    await pause(2500);

    await step('Company buys 100 credits with ETH');
    note('type: quantity');
    await type(page.getByLabel(`Quantity for ${PROJECT.title}`), BUY_QTY, 'Quantity');
    await click(page.getByRole('button', { name: 'Buy Credits' }), 'Buy Credits', { postClickDelay: 300 });
    const bought = await waitForDialog(/MARKETPLACE TRADE COMPLETE/, 'trade complete');
    assert(/0x[0-9a-f]{64}/i.test(bought), 'no tx hash in: ' + bought);
    await pause(4500);
    await L.hideDialog(page);

    // ============ Result ===============================================================
    const hundred = 100n * 10n ** 18n;
    const received = (await L.ethBalance(ngoAddr)) - ngoEthBefore;
    assert.strictEqual(received, 10n ** 17n, 'NGO should receive exactly 0.1 ETH (100 credits x 0.001)');
    assert.strictEqual(await L.bccBalance(token, companyAddr), hundred, 'Company should hold 100 BCC');
    assert.strictEqual(await L.bccBalance(token, ngoAddr), 1400n * 10n ** 18n, 'NGO should hold 1400 BCC');
    assert(companyEthBefore - (await L.ethBalance(companyAddr)) > 10n ** 17n, 'Company should have paid 0.1 ETH plus gas');

    note('result');
    await step('Result: the Company now holds 100 BCC');
    await L.smoothScroll(page, 0, 1200);
    await check(page.getByText('BCC Tokens Owned'), 'Company BCC balance card');
    await L.panElements(page, '.text-2xl.font-bold', 2);
    await pause(3000);

    await step(`Result: the NGO received ${L.fmt(received, 2)} ETH`);
    await logoutAndLogin('NGO');
    await connectWallet(/Wallet connected/);
    await check(page.getByText(/BCC: 1400/), 'NGO BCC 1400 in wallet card');
    await L.panElements(page, 'h3:has-text("Wallet connected"), .text-2xl.font-bold', 3);
    await pause(3500);
    await L.showSubtitle(page, '');

    // ============ End card =============================================================
    marks.push({ note: 'end-card', step: stepNo + 1, subtitle: 'End card', t: (Date.now() - t0) / 1000 });
    const chip = (t) => `<span style="display:inline-block;margin:6px;padding:8px 16px;border-radius:999px;background:rgba(255,255,255,.14);font-size:20px">${t}</span>`;
    await L.showCard(page, `
      <div style="font-size:42px;font-weight:700;margin-bottom:26px">Blue Carbon Registry</div>
      <div style="max-width:900px;margin-bottom:26px">${['Solidity', 'OpenZeppelin', 'Hardhat', 'React', 'TypeScript', 'ethers.js', 'Node / Express'].map(chip).join('')}</div>
      <div style="font-size:24px;margin-bottom:10px">Contracts deployed on the Sepolia testnet</div>
      <div style="font-size:24px;font-family:ui-monospace,Menlo,monospace;color:#7dd3fc;margin-bottom:34px">github.com/08pranav/Blue-Carbon-Registry-blockchain</div>
      <div style="font-size:15px;opacity:.65">This demo ran on a local test chain with a stand-in wallet.</div>`, 4500);
    marks.push({ step: stepNo + 2, subtitle: 'END', t: (Date.now() - t0) / 1000 });

    assert.strictEqual(consoleErrors.length, 0, 'console errors during the run:\n' + consoleErrors.join('\n'));
    console.log(REHEARSAL ? 'REHEARSAL PASSED - all selectors verified and every on-chain step succeeded' : DRY ? 'DRY RUN PASSED' : 'Flow finished');
  } catch (err) {
    console.error('DEMO ERROR:', err.message);
    process.exitCode = 1;
  } finally {
    await context.close();
    if (RECORD) {
      const video = page.video();
      if (video && process.exitCode !== 1) {
        const src = await video.path();
        fs.copyFileSync(src, OUTPUT);
        fs.writeFileSync(path.join(RUN_DIR, 'marks.json'), JSON.stringify(marks, null, 2));
        console.log('Video saved:', OUTPUT);
      } else if (video) {
        console.error('Run failed; video not saved. Raw file:', await video.path());
      }
    }
    await browser.close();
  }
})();
