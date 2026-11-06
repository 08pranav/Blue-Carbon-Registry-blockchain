import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoleAuthProvider, useRoleAuth, TEST_ACCOUNTS } from '@/contexts/RoleAuthContext';
import { FIXED_WALLETS, getRoleByWallet, validateWalletForRole } from '@/utils/fixedWallets.js';

const isAddress = (a: string) => /^0x[0-9a-fA-F]{40}$/.test(a);

describe('demo accounts & wallets', () => {
  it('every role account uses a valid Ethereum address', () => {
    for (const acc of TEST_ACCOUNTS) expect(isAddress(acc.address)).toBe(true);
    for (const addr of Object.values(FIXED_WALLETS)) expect(isAddress(addr)).toBe(true);
  });

  it('login accounts match the wallets the dashboards transact with', () => {
    for (const acc of TEST_ACCOUNTS) {
      expect(acc.address).toBe(FIXED_WALLETS[acc.role]);
    }
  });

  it('validates the connected wallet against the role (case-insensitive)', () => {
    expect(validateWalletForRole(FIXED_WALLETS.NGO.toLowerCase(), 'NGO')).toBe(true);
    expect(validateWalletForRole(FIXED_WALLETS.NGO, 'company')).toBe(FIXED_WALLETS.NGO === FIXED_WALLETS.COMPANY);
    expect(getRoleByWallet(FIXED_WALLETS.NGO)).toBe('NGO');
    expect(getRoleByWallet('0x0000000000000000000000000000000000000001')).toBeNull();
  });
});

const Probe = () => {
  const { authState, login, logout } = useRoleAuth();
  return (
    <div>
      <span data-testid="role">{authState.role ?? 'none'}</span>
      <button onClick={() => login(TEST_ACCOUNTS[0])}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
};

describe('RoleAuthProvider', () => {
  it('logs in and out of a role', () => {
    render(<RoleAuthProvider><Probe /></RoleAuthProvider>);
    expect(screen.getByTestId('role')).toHaveTextContent('none');
    fireEvent.click(screen.getByText('login'));
    expect(screen.getByTestId('role')).toHaveTextContent('NGO');
    fireEvent.click(screen.getByText('logout'));
    expect(screen.getByTestId('role')).toHaveTextContent('none');
  });

  it('throws when used outside the provider', () => {
    expect(() => render(<Probe />)).toThrow(/RoleAuthProvider/);
  });
});

describe('role wallets from env', () => {
  const NGO = '0x1111111111111111111111111111111111111111';
  const COMPANY = '0x2222222222222222222222222222222222222222';

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('uses VITE_*_WALLET overrides and keeps defaults for unset roles', async () => {
    const defaults = (await import('@/utils/fixedWallets.js')).FIXED_WALLETS;
    vi.resetModules();
    vi.stubEnv('VITE_NGO_WALLET', NGO);
    vi.stubEnv('VITE_COMPANY_WALLET', COMPANY);
    const { FIXED_WALLETS, getRoleByWallet } = await import('@/utils/fixedWallets.js');
    expect(FIXED_WALLETS.NGO).toBe(NGO);
    expect(FIXED_WALLETS.COMPANY).toBe(COMPANY);
    expect(FIXED_WALLETS.AUDITOR).toBe(defaults.AUDITOR);
    expect(getRoleByWallet(COMPANY.toUpperCase().replace('0X', '0x'))).toBe('COMPANY');
  });

  it('ignores an invalid override', async () => {
    const defaults = (await import('@/utils/fixedWallets.js')).FIXED_WALLETS;
    vi.resetModules();
    vi.stubEnv('VITE_NGO_WALLET', '0xnot-an-address');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { FIXED_WALLETS } = await import('@/utils/fixedWallets.js');
    expect(FIXED_WALLETS.NGO).toBe(defaults.NGO);
    expect(warn).toHaveBeenCalled();
  });
});
