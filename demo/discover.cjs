'use strict';
// Phase 1 (Discover): open every page/state in the demo flow and dump its interactive elements.
// Usage: node demo/discover.cjs   (stack must be running: demo/stack.sh start)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { installStandIns } = require('./lib.cjs');

const BASE_URL = process.env.DEMO_BASE_URL || 'http://localhost:8080';
const PHOTO = path.join(__dirname, '..', 'public', 'assets', 'hero-mangroves.jpg');
const out = {};

async function dump(page, label) {
  out[label] = await page.evaluate(() => {
    const els = [];
    document.querySelectorAll('input, select, textarea, button, a, [role="tab"], [contenteditable]').forEach(el => {
      if (el.offsetParent !== null) {
        els.push({
          tag: el.tagName,
          type: el.type || '',
          name: el.name || '',
          placeholder: el.placeholder || '',
          ariaLabel: el.getAttribute('aria-label') || '',
          text: el.textContent?.trim().substring(0, 40) || '',
          href: el.getAttribute('href') || '',
          contentEditable: el.contentEditable === 'true',
          role: el.getAttribute('role') || '',
          disabled: !!el.disabled,
          options: el.tagName === 'SELECT' ? Array.from(el.options).map(o => ({ value: o.value, text: o.text })) : undefined,
        });
      }
    });
    const headings = Array.from(document.querySelectorAll('h1,h2,h3')).filter(h => h.offsetParent !== null).map(h => `${h.tagName}: ${h.textContent.trim().substring(0, 60)}`);
    return { url: location.pathname, headings, elements: els };
  });
  console.log(`dumped ${label}: ${out[label].elements.length} elements`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  await installStandIns(context);
  const page = await context.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));

  await page.goto(BASE_URL + '/');
  await dump(page, 'home /');
  await page.getByRole('link', { name: 'Login', exact: true }).first().click();
  await page.waitForURL('**/login');
  await dump(page, 'login /login');

  // NGO
  await page.getByRole('button', { name: 'Login as NGO' }).click();
  await page.waitForURL('**/dashboard');
  await dump(page, 'ngo dashboard (before wallet)');
  await page.getByRole('button', { name: 'Connect Wallet' }).click();
  await page.getByRole('heading', { name: /Wallet connected/ }).waitFor();
  await dump(page, 'ngo dashboard (wallet connected) - My Projects tab');
  await page.getByRole('tab', { name: 'Submit New Project' }).click();
  await dump(page, 'ngo - Submit New Project tab');
  await page.getByPlaceholder('e.g., Mangrove Restoration in Goa').fill('Discovery test');
  await page.getByPlaceholder('Describe your project, methods and expected impact').fill('x');
  await page.getByPlaceholder('e.g., Goa, India').fill('Goa');
  await page.getByPlaceholder('15.3').fill('15.3');
  await page.getByPlaceholder('73.9').fill('73.9');
  await page.getByPlaceholder('Estimated number of carbon credits').fill('100');
  await page.getByLabel('Field photos').setInputFiles({ name: 'discovery-mangrove.jpg', mimeType: 'image/jpeg', buffer: fs.readFileSync(PHOTO) });
  await page.getByRole('button', { name: 'Submit Project for Review' }).click();
  await page.getByText('Automated evidence screening:').first().waitFor();
  await dump(page, 'ngo - Submit tab after submitting (screening result shown)');
  await page.getByRole('navigation').getByRole('button', { name: 'Logout' }).click();

  // Auditor
  await page.goto(BASE_URL + '/login');
  await page.getByRole('button', { name: 'Login as AUDITOR' }).click();
  await page.waitForURL('**/dashboard');
  await dump(page, 'auditor dashboard (before wallet)');
  await page.getByRole('button', { name: 'Connect Wallet' }).click();
  await page.getByRole('heading', { name: /Auditor wallet connected/ }).waitFor();
  await page.getByText('Discovery test').first().click();
  await dump(page, 'auditor - project selected (review panel)');
  await page.getByRole('button', { name: 'Approve & Issue BCC' }).click();
  await page.getByText('Reviewed (1)').waitFor({ timeout: 30000 });
  await page.getByRole('tab', { name: /Reviewed/ }).click();
  await dump(page, 'auditor - Reviewed tab');
  await page.getByRole('navigation').getByRole('button', { name: 'Logout' }).click();

  // NGO manage credits
  await page.goto(BASE_URL + '/login');
  await page.getByRole('button', { name: 'Login as NGO' }).click();
  await page.waitForURL('**/dashboard');
  await page.getByRole('button', { name: 'Connect Wallet' }).click();
  await page.getByRole('heading', { name: /Wallet connected/ }).waitFor();
  await page.getByRole('tab', { name: 'Manage Credits' }).click();
  await page.waitForTimeout(1500);
  await dump(page, 'ngo - Manage Credits tab');
  await page.getByRole('navigation').getByRole('button', { name: 'Logout' }).click();

  // Company
  await page.goto(BASE_URL + '/login');
  await page.getByRole('button', { name: 'Login as COMPANY' }).click();
  await page.waitForURL('**/dashboard');
  await page.getByText('Discovery test').first().waitFor();
  await dump(page, 'company dashboard (marketplace listings)');

  out.consoleErrors = errors;
  fs.writeFileSync(path.join(__dirname, '.run', 'discovery.json'), JSON.stringify(out, null, 2));
  console.log('console errors during discovery:', errors.length);
  errors.forEach(e => console.log('  ', e.slice(0, 200)));
  await browser.close();
})().catch(e => { console.error('DISCOVERY ERROR:', e.message); process.exit(1); });
