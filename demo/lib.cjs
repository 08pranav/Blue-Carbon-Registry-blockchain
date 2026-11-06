'use strict';
// Shared helpers for the demo scripts (discover.cjs, record-demo.cjs).
// Includes the recording helpers (cursor, subtitles, moveAndClick, typeSlowly, ...) and the
// stand-in wallet that signs transactions on the local Hardhat chain without MetaMask.

const RPC_URL = process.env.DEMO_RPC_URL || 'http://127.0.0.1:8545';

// ---------------------------------------------------------------------------------------------
// Stand-in wallet. Runs inside the page before the app loads.
// window.ethereum forwards every JSON-RPC call to the local Hardhat node, which signs with its
// unlocked accounts. The "selected MetaMask account" follows the role that is logged in
// (Hardhat accounts #0 / #1 / #2 = Auditor / NGO / Company, as written by `npm run deploy:local`).
// ---------------------------------------------------------------------------------------------
function standInWalletInit(rpcUrl) {
  const ROLE_INDEX = { AUDITOR: 0, NGO: 1, COMPANY: 2 };
  let cached;
  const rpc = async (method, params) => {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params: params || [] }),
    });
    const json = await res.json();
    if (json.error) throw Object.assign(new Error(json.error.message), { code: json.error.code });
    return json.result;
  };
  // MetaMask semantics: a site sees no accounts until the user approves "Connect", and the
  // approval is remembered afterwards.
  const permitted = () => localStorage.getItem('standInWalletPermitted') === '1';
  const currentAccount = () => {
    const role = JSON.parse(localStorage.getItem('roleAuth') || '{}').role;
    return cached ? cached[ROLE_INDEX[role] ?? 0] : undefined;
  };
  // Like MetaMask, tell the app when the selected account changes (here: when another role logs in)
  const listeners = {};
  let last;
  setInterval(async () => {
    cached = cached || (await rpc('eth_accounts'));
    const now = currentAccount();
    if (permitted() && last && now !== last) (listeners.accountsChanged || []).forEach((fn) => fn([now]));
    last = now;
  }, 200);
  window.ethereum = {
    isStandInWallet: true,
    request: async ({ method, params }) => {
      if (method === 'eth_requestAccounts') {
        localStorage.setItem('standInWalletPermitted', '1');
        cached = cached || (await rpc('eth_accounts'));
        return [currentAccount()];
      }
      if (method === 'eth_accounts') {
        cached = cached || (await rpc('eth_accounts'));
        return permitted() ? [currentAccount()] : [];
      }
      if (method === 'wallet_switchEthereumChain') return null;
      return rpc(method, params);
    },
    on(event, fn) { (listeners[event] = listeners[event] || []).push(fn); },
    removeListener(event, fn) { listeners[event] = (listeners[event] || []).filter((f) => f !== fn); },
  };
}

// The app uses window.alert / window.confirm for transaction messages. Native dialogs are not
// captured by video recording, so the real message text is rendered in an in-page dialog box
// instead (confirm is auto-accepted, like pressing OK).
function dialogOverlayInit() {
  const render = (message, kind) => {
    let box = document.getElementById('demo-dialog');
    if (!box) {
      box = document.createElement('div');
      box.id = 'demo-dialog';
      box.style.cssText = 'position:fixed;left:50%;top:70px;transform:translateX(-50%);z-index:999997;' +
        'width:620px;max-width:92vw;background:#fff;color:#111827;border-radius:12px;' +
        'box-shadow:0 20px 60px rgba(0,0,0,.45);font-family:-apple-system,"Segoe UI",sans-serif;' +
        'border:1px solid #d1d5db;overflow:hidden;';
      (document.body || document.documentElement).appendChild(box);
    }
    const text = String(message).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    box.innerHTML =
      '<div style="padding:10px 18px;background:#f3f4f6;font-size:13px;color:#4b5563;border-bottom:1px solid #e5e7eb">' +
      location.host + ' says' + (kind === 'confirm' ? ' (confirm)' : '') + '</div>' +
      '<div style="padding:16px 18px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-break:break-all">' + text + '</div>' +
      '<div style="padding:10px 18px;text-align:right"><span style="display:inline-block;padding:6px 22px;border-radius:6px;' +
      'background:#2563eb;color:#fff;font-size:13px;font-weight:600">OK</span></div>';
    window.__lastDialog = String(message);
    (window.__dialogLog = window.__dialogLog || []).push({ kind, message: String(message) });
  };
  window.alert = (m) => render(m, 'alert');
  window.confirm = (m) => { render(m, 'confirm'); return true; };
}

async function installStandIns(context) {
  await context.addInitScript(standInWalletInit, RPC_URL);
  await context.addInitScript(dialogOverlayInit);
}

async function hideDialog(page) {
  await page.evaluate(() => document.getElementById('demo-dialog')?.remove());
}

async function lastDialog(page) {
  return page.evaluate(() => window.__lastDialog || '');
}

// ---------------------------------------------------------------------------------------------
// Direct chain reads (for real before/after numbers in subtitles and checks)
// ---------------------------------------------------------------------------------------------
async function rpcCall(method, params = []) {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}
const ethBalance = async (addr) => BigInt(await rpcCall('eth_getBalance', [addr, 'latest']));
async function bccBalance(token, addr) {
  const data = '0x70a08231' + addr.toLowerCase().replace('0x', '').padStart(64, '0');
  return BigInt(await rpcCall('eth_call', [{ to: token, data }, 'latest']));
}
const fmt = (wei, digits = 4) => (Number(wei) / 1e18).toFixed(digits);

// ---------------------------------------------------------------------------------------------
// Recording helpers (from the ui-demo skill)
// SPEED scales every pause: 1 = natural pacing (recording), ~0.05 = fast rehearsal.
// ---------------------------------------------------------------------------------------------
let SPEED = 1;
const setSpeed = (v) => { SPEED = v; };
const wait = (page, ms) => page.waitForTimeout(Math.round(ms * SPEED));
async function injectCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;
    cursor.style.cssText = `
      position: fixed; z-index: 999999; pointer-events: none;
      width: 24px; height: 24px;
      transition: left 0.1s, top 0.1s;
      filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
    `;
    cursor.style.left = (window.__cursorX ?? 640) + 'px';
    cursor.style.top = (window.__cursorY ?? 360) + 'px';
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', (e) => {
      window.__cursorX = e.clientX; window.__cursorY = e.clientY;
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
  });
}

async function injectSubtitleBar(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-subtitle')) return;
    const bar = document.createElement('div');
    bar.id = 'demo-subtitle';
    bar.style.cssText = `
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 999998;
      text-align: center; padding: 12px 24px;
      background: rgba(0, 0, 0, 0.75);
      color: white; font-family: -apple-system, "Segoe UI", sans-serif;
      font-size: 16px; font-weight: 500; letter-spacing: 0.3px;
      transition: opacity 0.3s;
      pointer-events: none;
    `;
    bar.textContent = window.__subtitle || '';
    bar.style.opacity = window.__subtitle ? '1' : '0';
    document.body.appendChild(bar);
  });
}

async function showSubtitle(page, text) {
  await page.evaluate((t) => {
    window.__subtitle = t || '';
    const bar = document.getElementById('demo-subtitle');
    if (!bar) return;
    if (t) { bar.textContent = t; bar.style.opacity = '1'; } else { bar.style.opacity = '0'; }
  }, text);
  if (text) await wait(page, 800);
}

// Re-inject both overlays (call after every navigation)
async function overlays(page) {
  await injectCursor(page);
  await injectSubtitleBar(page);
}

async function ensureVisible(page, locator, label) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    const msg = `REHEARSAL FAIL: "${label}" not found - selector: ${typeof locator === 'string' ? locator : '(locator object)'}`;
    console.error(msg);
    const found = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, input, select, textarea, a'))
        .filter(el => el.offsetParent !== null)
        .map(el => `${el.tagName}[${el.type || ''}] "${el.textContent?.trim().substring(0, 30)}"`)
        .join('\n  ');
    });
    console.error('  Visible elements:\n  ' + found);
    return false;
  }
  console.log(`REHEARSAL OK: "${label}"`);
  return true;
}

async function moveAndClick(page, locator, label, opts = {}) {
  const { postClickDelay = 800, ...clickOpts } = opts;
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    throw new Error(`moveAndClick: "${label}" not visible`);
  }
  await el.scrollIntoViewIfNeeded();
  await wait(page, 300);
  const box = await el.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
    await wait(page, 400);
  }
  await el.click(clickOpts);
  await wait(page, postClickDelay);
  return true;
}

async function typeSlowly(page, locator, text, label, charDelay = 35) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) throw new Error(`typeSlowly: "${label}" not visible`);
  await moveAndClick(page, el, label, { postClickDelay: 200 });
  await el.fill('');
  await el.pressSequentially(text, { delay: Math.round(charDelay * SPEED) });
  await wait(page, 500);
  return true;
}

async function panElements(page, selector, maxCount = 6) {
  const elements = await page.locator(selector).all();
  for (let i = 0; i < Math.min(elements.length, maxCount); i++) {
    const box = await elements[i].boundingBox();
    if (box && box.y > 0 && box.y < 650) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
      await wait(page, 600);
    }
  }
}

async function smoothScroll(page, top, ms = 1500) {
  await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'smooth' }), top);
  await wait(page, ms);
}

// Smoothly bring an element into the middle of the viewport (no jump)
async function smoothScrollTo(page, locator, label, ms = 1400) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  if (!(await el.isVisible().catch(() => false))) throw new Error(`smoothScrollTo: "${label}" not visible`);
  await el.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  await wait(page, ms);
}

// Full-screen title / end card, shown over whatever page is loaded
async function showCard(page, html, ms) {
  await page.evaluate((markup) => {
    document.getElementById('demo-card')?.remove();
    const card = document.createElement('div');
    card.id = 'demo-card';
    card.style.cssText = 'position:fixed;inset:0;z-index:1000000;display:flex;flex-direction:column;align-items:center;' +
      'justify-content:center;text-align:center;padding:60px;color:#fff;opacity:0;transition:opacity .6s;' +
      'font-family:-apple-system,"Segoe UI",sans-serif;background:linear-gradient(135deg,#052e3f 0%,#0b5d7a 55%,#0f766e 100%);';
    card.innerHTML = markup;
    document.body.appendChild(card);
    requestAnimationFrame(() => { card.style.opacity = '1'; });
  }, html);
  await wait(page, ms);
}
async function hideCard(page) {
  await page.evaluate(() => { const c = document.getElementById('demo-card'); if (c) c.style.opacity = '0'; });
  await wait(page, 700);
  await page.evaluate(() => document.getElementById('demo-card')?.remove());
}

module.exports = {
  setSpeed, wait,
  RPC_URL, installStandIns, hideDialog, lastDialog, rpcCall, ethBalance, bccBalance, fmt,
  injectCursor, injectSubtitleBar, showSubtitle, overlays, ensureVisible, moveAndClick, typeSlowly,
  panElements, smoothScroll, smoothScrollTo, showCard, hideCard,
};
