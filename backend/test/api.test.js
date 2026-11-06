// API tests: node --test test/   (no extra dependencies; uses Node's built-in runner and fetch)
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

process.env.UPLOADS_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'bcr-uploads-'));
// a tiny stand-in for the built frontend, to test static serving and the SPA fallback
const staticDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bcr-static-'));
fs.writeFileSync(path.join(staticDir, 'index.html'), '<!doctype html><title>spa</title>');
process.env.STATIC_DIR = staticDir;
const sharp = require('sharp');
const app = require('../app');

const NGO = '0x24cF2631Cd812089e14da2Bb6d7A7C5505258656';
const OTHER = '0x1111111111111111111111111111111111111111';
const TX = '0x' + 'ab'.repeat(32);
const TX2 = '0x' + 'cd'.repeat(32);

let server;
let base;

before(async () => {
  await new Promise(resolve => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server.close(); fs.rmSync(process.env.UPLOADS_DIR, { recursive: true, force: true }); fs.rmSync(staticDir, { recursive: true, force: true }); });

const json = async (method, url, body) => {
  const res = await fetch(base + url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json() };
};

// A 1200x900 green-dominant JPEG with noise (flat colours compress below the 30KB size check)
const greenPhoto = () => {
  const w = 1200, h = 900;
  const raw = Buffer.alloc(w * h * 3);
  for (let i = 0; i < raw.length; i += 3) {
    raw[i] = 20 + Math.random() * 60;       // R
    raw[i + 1] = 110 + Math.random() * 90;  // G
    raw[i + 2] = 20 + Math.random() * 60;   // B
  }
  return sharp(raw, { raw: { width: w, height: h, channels: 3 } }).jpeg({ quality: 95 }).toBuffer();
};
const tinyPhoto = () => sharp({ create: { width: 100, height: 100, channels: 3, background: { r: 200, g: 60, b: 60 } } })
  .jpeg().toBuffer();

const submit = async (photos, extra = {}) => {
  const form = new FormData();
  const fields = {
    title: 'Test mangroves', description: 'Planting', ecosystem: 'MANGROVE', location: 'Goa',
    latitude: '15.3', longitude: '73.9', area: '10', carbonCreditsEstimated: '100',
    submitterAddress: NGO, submitterName: 'Test NGO', ...extra,
  };
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  photos.forEach((buf, i) => form.append('files', new Blob([buf], { type: 'image/jpeg' }), `photo${i}.jpg`));
  const res = await fetch(base + '/api/projects', { method: 'POST', body: form });
  return { status: res.status, body: await res.json() };
};

test('starts with sample projects pending and nothing listed', async () => {
  const projects = await json('GET', '/api/projects?role=AUDITOR');
  assert.ok(projects.body.projects.length >= 2);
  assert.ok(projects.body.projects.every(p => p.status === 'PENDING'));
  const listings = await json('GET', '/api/marketplace/listings');
  assert.deepEqual(listings.body.listings, []);
});

test('rejects invalid submissions', async () => {
  assert.equal((await submit([], { ecosystem: 'DESERT' })).status, 400);
  assert.equal((await submit([], { latitude: '120' })).status, 400);
  assert.equal((await submit([], { submitterAddress: '0xnope' })).status, 400);
});

test('evidence screening: low-resolution photo is flagged', async () => {
  const { status, body } = await submit([await tinyPhoto()]);
  assert.equal(status, 201);
  assert.equal(body.aiReview.status, 'REJECT');
  assert.match(body.aiReview.results[0].issues.join(' '), /Low resolution/);
});

test('evidence screening: large green photo passes the colour heuristic', async () => {
  const { body } = await submit([await greenPhoto()]);
  const r = body.aiReview.results[0];
  assert.equal(r.signals.greenDominance, true);
  assert.equal(r.ok, true);
  assert.notEqual(body.aiReview.status, 'REJECT');
  assert.equal(body.project.status, 'PENDING');
  assert.equal(body.project.ngoAddress, NGO);
});

test('NGOs only see their own projects', async () => {
  const mine = await json('GET', `/api/projects?role=NGO&userId=${NGO.toLowerCase()}`);
  assert.ok(mine.body.projects.length >= 2);
  const other = await json('GET', `/api/projects?role=NGO&userId=${OTHER}`);
  assert.equal(other.body.projects.length, 0);
});

test('approval -> listing -> NGO edit -> purchase', async () => {
  const id = 'PRJ-DEMO1';

  // approval needs a real credit amount and the on-chain tx hash
  assert.equal((await json('PATCH', `/api/projects/${id}/status`, { status: 'VERIFIED', allocatedCredits: 0, mintTxHash: TX })).status, 400);
  assert.equal((await json('PATCH', `/api/projects/${id}/status`, { status: 'VERIFIED', allocatedCredits: 50, mintTxHash: 'nope' })).status, 400);

  const approved = await json('PATCH', `/api/projects/${id}/status`, { status: 'VERIFIED', allocatedCredits: 50, mintTxHash: TX, notes: 'ok' });
  assert.equal(approved.status, 200);
  assert.equal(approved.body.project.mintTxHash, TX);
  assert.equal((await json('PATCH', `/api/projects/${id}/status`, { status: 'REJECTED' })).status, 409);

  // approval produced a listing at the default price, owned by the NGO
  let { body } = await json('GET', '/api/marketplace/listings');
  assert.equal(body.listings.length, 1);
  assert.equal(body.listings[0].credits, 50);
  assert.equal(body.listings[0].pricePerCredit, '0.001');
  assert.equal(body.listings[0].ngoAddress, NGO);

  // only the owning NGO can change it, within the allocated amount
  assert.equal((await json('POST', '/api/marketplace/listings', { projectId: id, credits: 20, pricePerCredit: 0.002, ngoAddress: OTHER })).status, 403);
  assert.equal((await json('POST', '/api/marketplace/listings', { projectId: id, credits: 51, pricePerCredit: 0.002, ngoAddress: NGO })).status, 400);
  assert.equal((await json('POST', '/api/marketplace/listings', { projectId: id, credits: 20, pricePerCredit: 0, ngoAddress: NGO })).status, 400);
  assert.equal((await json('POST', '/api/marketplace/listings', { projectId: id, credits: 20, pricePerCredit: 0.002, ngoAddress: NGO.toLowerCase() })).status, 201);

  ({ body } = await json('GET', '/api/marketplace/listings'));
  assert.equal(body.listings[0].credits, 20);
  assert.equal(body.listings[0].pricePerCredit, '0.002');

  // purchases are recorded against the on-chain tx hash
  const listingId = body.listings[0].id;
  assert.equal((await json('POST', '/api/marketplace/purchase', { listingId, quantity: 21, buyerAddress: OTHER, txHash: TX2 })).status, 400);
  assert.equal((await json('POST', '/api/marketplace/purchase', { listingId, quantity: 5, buyerAddress: OTHER, txHash: 'bad' })).status, 400);
  const bought = await json('POST', '/api/marketplace/purchase', { listingId, quantity: 5, buyerAddress: OTHER, txHash: TX2 });
  assert.equal(bought.status, 201);
  assert.equal(bought.body.transaction.totalAmountEth, '0.01');
  assert.equal((await json('POST', '/api/marketplace/purchase', { listingId, quantity: 1, buyerAddress: OTHER, txHash: TX2 })).status, 409);

  ({ body } = await json('GET', '/api/marketplace/listings'));
  assert.equal(body.listings[0].credits, 15);
  const tx = await json('GET', `/api/marketplace/transactions?address=${OTHER}`);
  assert.equal(tx.body.transactions.length, 1);

  // the NGO cannot re-list credits that were already sold
  assert.equal((await json('POST', '/api/marketplace/listings', { projectId: id, credits: 50, pricePerCredit: 0.002, ngoAddress: NGO })).status, 400);
});

test('selling out removes the listing from the marketplace', async () => {
  const { body } = await json('GET', '/api/marketplace/listings');
  const listing = body.listings[0];
  await json('POST', '/api/marketplace/purchase', { listingId: listing.id, quantity: listing.credits, buyerAddress: OTHER, txHash: '0x' + 'ef'.repeat(32) });
  const after = await json('GET', '/api/marketplace/listings');
  assert.equal(after.body.listings.length, 0);
});

test('serves the built frontend with a SPA fallback, without shadowing the API', async () => {
  const home = await fetch(base + '/');
  assert.equal(home.status, 200);
  assert.match(await home.text(), /<title>spa<\/title>/);
  const login = await fetch(base + '/login'); // client-side route
  assert.equal(login.status, 200);
  assert.match(await login.text(), /<title>spa<\/title>/);
  assert.equal((await fetch(base + '/api/health')).status, 200);
  assert.equal((await fetch(base + '/api/does-not-exist')).status, 404);
});
