import { describe, it, expect } from 'vitest';
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
