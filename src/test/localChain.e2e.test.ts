// End-to-end test of the app's real wallet code against a local Hardhat node.
//
//   npm run test:e2e-local
//
// It starts `hardhat node`, deploys the contracts the same way the deploy scripts do (token owned by
// the Marketplace), then drives TokenTransferService exactly as the dashboards do:
//   auditor issues BCC -> NGO approves the Marketplace -> company buys.
// Only the wallet is faked: a minimal window.ethereum that forwards JSON-RPC to the node, which
// signs with its unlocked accounts. Skipped unless RUN_LOCAL_E2E=1 (it needs a compiled Hardhat project).
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { spawn, execSync, type ChildProcess } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { ContractFactory, JsonRpcProvider, parseEther, formatEther, Contract } from 'ethers';

const enabled = process.env.RUN_LOCAL_E2E === '1';
const PORT = 8546;
const RPC = `http://127.0.0.1:${PORT}`;
const HH = path.resolve(__dirname, '../../blockchain-deployment');
const rpc = (method: string, params: unknown[] = []) =>
  new Promise<unknown>((resolve, reject) => {
    const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params });
    const req = http.request(RPC, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => {
        const json = JSON.parse(data);
        if (json.error) reject(Object.assign(new Error(json.error.message), { code: json.error.code, data: json.error.data }));
        else resolve(json.result);
      });
    });
    req.on('error', reject);
    req.end(body);
  });

describe.skipIf(!enabled)('local chain: the real wallet code against Hardhat', () => {
  let node: ChildProcess;
  let accounts: string[];
  let current = 0; // which account "MetaMask" has selected
  let tokenAddress: string;
  let marketAddress: string;
  let token: Contract;
  let market: Contract;
  let service: typeof import('@/utils/TokenTransferService').tokenTransferService;
  const provider = () => new JsonRpcProvider(RPC);

  beforeAll(async () => {
    if (!existsSync(path.join(HH, 'artifacts/contracts/Marketplace.sol/Marketplace.json'))) {
      execSync('npx hardhat compile', { cwd: HH, stdio: 'ignore' });
    }
    node = spawn('npx', ['hardhat', 'node', '--port', String(PORT)], { cwd: HH, stdio: ['ignore', 'pipe', 'ignore'] });
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('hardhat node did not start')), 60000);
      node.stdout!.on('data', d => { if (String(d).includes('Started HTTP')) { clearTimeout(t); resolve(); } });
    });

    accounts = (await rpc('eth_accounts')) as string[];
    // Deploy like scripts/deployCore.cjs: token, marketplace, then hand token ownership to the marketplace
    const artifact = (name: string) => JSON.parse(readFileSync(path.join(HH, `artifacts/contracts/${name}.sol/${name}.json`), 'utf8'));
    const deployer = await provider().getSigner(0); // Hardhat's unlocked account #0
    const T = artifact('CarbonCreditToken');
    const M = artifact('Marketplace');
    token = (await new ContractFactory(T.abi, T.bytecode, deployer).deploy(await deployer.getAddress())) as unknown as Contract;
    await token.waitForDeployment();
    tokenAddress = await token.getAddress();
    market = (await new ContractFactory(M.abi, M.bytecode, deployer).deploy(tokenAddress)) as unknown as Contract;
    await market.waitForDeployment();
    marketAddress = await market.getAddress();
    await (await token.transferOwnership(marketAddress)).wait();

    // Point the app at the local chain, with Hardhat accounts as Auditor / NGO / Company
    vi.resetModules();
    vi.stubEnv('VITE_NETWORK', 'LOCAL');
    vi.stubEnv('VITE_LOCAL_RPC_URL', RPC);
    vi.stubEnv('VITE_LOCAL_TOKEN_ADDRESS', tokenAddress);
    vi.stubEnv('VITE_LOCAL_MARKETPLACE_ADDRESS', marketAddress);
    vi.stubEnv('VITE_AUDITOR_WALLET', accounts[0]);
    vi.stubEnv('VITE_NGO_WALLET', accounts[1]);
    vi.stubEnv('VITE_COMPANY_WALLET', accounts[2]);
    (window as unknown as { ethereum: unknown }).ethereum = {
      request: async ({ method, params }: { method: string; params?: unknown[] }) => {
        if (method === 'eth_requestAccounts' || method === 'eth_accounts') return [accounts[current]];
        if (method === 'wallet_switchEthereumChain') return null;
        return rpc(method, (params as unknown[]) ?? []);
      },
    };
    ({ tokenTransferService: service } = await import('@/utils/TokenTransferService'));
  }, 120000);

  afterAll(() => {
    node?.kill();
    vi.unstubAllEnvs();
  });

  const bcc = async (addr: string) => formatEther(await token.balanceOf(addr));

  it('is wired like the live deployment: the marketplace owns the token, the auditor is admin', async () => {
    expect(await token.owner()).toBe(marketAddress);
    expect((await market.admin()).toLowerCase()).toBe(accounts[0].toLowerCase());
  });

  it('refuses to issue credits from the wrong wallet', async () => {
    current = 2; // company account selected in MetaMask
    const result = await service.mintCreditsToNGO(accounts[1], 100, accounts[0], 'Test NGO');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Wrong wallet connected/);
    expect(await bcc(accounts[1])).toBe('0.0');
  });

  it('auditor: registers the NGO if needed and issues BCC through verifyNGO', async () => {
    current = 0;
    const first = await service.mintCreditsToNGO(accounts[1], 100, accounts[0], 'Test NGO');
    expect(first.success, first.error).toBe(true);
    expect(first.registerTxHash).toBeTruthy(); // first approval also registered the NGO on-chain
    expect(await bcc(accounts[1])).toBe('100.0');

    const second = await service.mintCreditsToNGO(accounts[1], 20, accounts[0], 'Test NGO');
    expect(second.success, second.error).toBe(true);
    expect(second.registerTxHash).toBeUndefined(); // already registered: only verifyNGO
    expect(await bcc(accounts[1])).toBe('120.0');
    expect((await market.getNgoById(1)).creditsAllocated).toBe(parseEther('120'));
  });

  it('company: cannot buy until the NGO approves the marketplace', async () => {
    current = 2;
    const result = await service.transferCreditsToCompany(accounts[1], accounts[2], 10, '0.01');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/approved only 0\.0 BCC|has only approved/);
  });

  it('NGO approves, company buys: BCC moves to the company and ETH to the NGO', async () => {
    current = 1;
    const approval = await service.approveMarketplace(10);
    expect(approval.success, approval.error).toBe(true);
    expect(await service.getMarketplaceAllowance(accounts[1])).toBe('10.0');

    current = 2;
    const ngoEthBefore = await provider().getBalance(accounts[1]);
    const result = await service.transferCreditsToCompany(accounts[1], accounts[2], 10, '0.01');
    expect(result.success, result.error).toBe(true);

    expect(await bcc(accounts[2])).toBe('10.0');
    expect(await bcc(accounts[1])).toBe('110.0');
    expect((await provider().getBalance(accounts[1])) - ngoEthBefore).toBe(parseEther('0.01'));

    // The receipt has the events the Etherscan section of the guide tells readers to look for
    const receipt = await provider().getTransactionReceipt(result.txHash!);
    const names = receipt!.logs.map(l => {
      try { return (market.interface.parseLog(l) ?? token.interface.parseLog(l))?.name; } catch { return token.interface.parseLog(l)?.name; }
    });
    expect(names).toContain('TradeExecuted');
    expect(names).toContain('Transfer');
    expect(await market.nextTradeId()).toBe(2n);
  });
});
