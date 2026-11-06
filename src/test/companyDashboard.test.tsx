import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { RoleAuthProvider, useRoleAuth, TEST_ACCOUNTS } from '@/contexts/RoleAuthContext';
import { FIXED_WALLETS } from '@/utils/fixedWallets';

const listing = {
  id: 'LST-PRJ-1',
  projectId: 'PRJ-1',
  projectName: 'Goa Mangroves',
  description: 'Replanting',
  ecosystem: 'MANGROVE',
  location: 'Goa',
  ngoAddress: '0x24cF2631Cd812089e14da2Bb6d7A7C5505258656',
  ngoName: 'Test NGO',
  credits: 40,
  pricePerCredit: '0.002',
  vintage: '2026',
  certification: 'Auditor-verified, issued on-chain as BCC',
};
const TX = '0x' + 'ab'.repeat(32);

vi.mock('@/lib/api', async importOriginal => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  api: {
    listListings: vi.fn(),
    recordPurchase: vi.fn(),
  },
}));
vi.mock('@/utils/TokenTransferService', () => ({
  tokenTransferService: {
    getETHBalance: vi.fn(),
    getTokenBalance: vi.fn(),
    transferCreditsToCompany: vi.fn(),
  },
}));

import { api } from '@/lib/api';
import { tokenTransferService } from '@/utils/TokenTransferService';
import CompanyDashboard from '@/pages/CompanyDashboard';

const LoginAsCompany = () => {
  const { login } = useRoleAuth();
  useEffect(() => login(TEST_ACCOUNTS.find(a => a.role === 'COMPANY')!), []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

const renderDashboard = () =>
  render(
    <RoleAuthProvider>
      <LoginAsCompany />
      <CompanyDashboard />
    </RoleAuthProvider>
  );

describe('CompanyDashboard', () => {
  beforeEach(() => {
    vi.mocked(tokenTransferService.getETHBalance).mockResolvedValue('1.0');
    vi.mocked(tokenTransferService.getTokenBalance).mockResolvedValue('0.0');
    vi.mocked(api.listListings).mockResolvedValue([listing] as never);
    vi.mocked(api.recordPurchase).mockResolvedValue({ transaction: { id: 'TX-1' } });
    vi.mocked(tokenTransferService.transferCreditsToCompany).mockResolvedValue({ success: true, txHash: TX, message: 'done' });
    vi.stubGlobal('alert', vi.fn());
  });

  it('shows listings loaded from the API (not hardcoded)', async () => {
    renderDashboard();
    expect(await screen.findByText('Goa Mangroves')).toBeInTheDocument();
    expect(screen.getByText('0.002 ETH')).toBeInTheDocument();
    expect(screen.getByText('40 credits')).toBeInTheDocument();
    expect(api.listListings).toHaveBeenCalled();
  });

  it('buys through the Marketplace contract, then records the sale with the tx hash', async () => {
    renderDashboard();
    fireEvent.change(await screen.findByLabelText('Quantity for Goa Mangroves'), { target: { value: '10' } });
    fireEvent.click(screen.getByText('Buy Credits'));

    await waitFor(() => expect(api.recordPurchase).toHaveBeenCalled());
    expect(tokenTransferService.transferCreditsToCompany).toHaveBeenCalledWith(listing.ngoAddress, FIXED_WALLETS.COMPANY, 10, '0.02');
    expect(api.recordPurchase).toHaveBeenCalledWith({ listingId: listing.id, quantity: 10, buyerAddress: FIXED_WALLETS.COMPANY, txHash: TX });
  });

  it('does not record a sale when the on-chain purchase fails', async () => {
    vi.mocked(tokenTransferService.transferCreditsToCompany).mockResolvedValue({ success: false, error: 'rejected' });
    renderDashboard();
    fireEvent.click(await screen.findByText('Buy Credits'));
    await waitFor(() => expect(alert).toHaveBeenCalledWith(expect.stringContaining('Purchase failed')));
    expect(api.recordPurchase).not.toHaveBeenCalled();
  });
});
