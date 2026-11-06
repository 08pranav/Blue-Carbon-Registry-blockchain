import React, { useState, useEffect, useCallback } from 'react';
import { useRoleAuth } from '../contexts/RoleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Loader, Building2, ShoppingCart, Leaf, Wallet, TrendingUp, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { tokenTransferService } from '../utils/TokenTransferService';
import { FIXED_WALLETS } from '../utils/fixedWallets';
import { getTxUrl } from '../blockchain-integration/config';
import { api, type Listing } from '@/lib/api';
import { errorMessage } from '@/lib/errors';

export default function CompanyDashboard() {
  const { authState, logout } = useRoleAuth();
  const companyAddress = FIXED_WALLETS.COMPANY;

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [tokenBalance, setTokenBalance] = useState('0');
  const [ethBalance, setEthBalance] = useState('0');
  const [lastTx, setLastTx] = useState<string | null>(null);

  const loadBalances = useCallback(async () => {
    const [eth, bcc] = await Promise.all([
      tokenTransferService.getETHBalance(companyAddress),
      tokenTransferService.getTokenBalance(companyAddress),
    ]);
    setEthBalance(eth);
    setTokenBalance(bcc);
  }, [companyAddress]);

  const loadListings = useCallback(async () => {
    try {
      setListings(await api.listListings());
      setLoadError(null);
    } catch (error) {
      setLoadError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
    loadBalances();
  }, [loadListings, loadBalances]);

  const handlePurchase = async (listing: Listing) => {
    const quantity = parseInt(quantities[listing.id] ?? '1', 10);
    if (!quantity || quantity <= 0 || quantity > listing.credits) {
      alert(`Enter a quantity between 1 and ${listing.credits}`);
      return;
    }

    setPurchasing(listing.id);
    try {
      const totalPrice = (quantity * Number(listing.pricePerCredit)).toString();

      // Marketplace.executeTrade(): ETH to the NGO, BCC from the NGO to this wallet
      const result = await tokenTransferService.transferCreditsToCompany(listing.ngoAddress, companyAddress, quantity, totalPrice);
      if (!result.success || !result.txHash) {
        alert(`❌ Purchase failed: ${result.error}`);
        return;
      }

      setLastTx(result.txHash);
      try {
        await api.recordPurchase({ listingId: listing.id, quantity, buyerAddress: companyAddress, txHash: result.txHash });
      } catch (error) {
        alert(`The on-chain purchase succeeded (${result.txHash}) but the marketplace record could not be updated: ${errorMessage(error)}`);
      }
      alert(result.message || `✅ Purchased ${quantity} credits`);
      await Promise.all([loadListings(), loadBalances()]);
    } catch (error) {
      alert(`❌ Purchase failed: ${errorMessage(error)}`);
    } finally {
      setPurchasing(null);
    }
  };

  if (!authState.isAuthenticated || authState.role !== 'COMPANY') {
    return <div>Access denied. Company role required.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
              <p className="text-gray-600">Welcome, {authState.user?.name}</p>
              <p className="text-xs font-mono text-gray-500">Wallet to use in MetaMask: {companyAddress}</p>
            </div>
          </div>
          <Button onClick={logout} variant="outline">Logout</Button>
        </div>

        {loadError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 text-sm text-red-700">⚠️ {loadError}</CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between"><Wallet className="w-5 h-5 text-blue-600" /><Badge variant="secondary">Wallet</Badge></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tokenBalance}</div>
              <p className="text-sm text-gray-600">BCC Tokens Owned</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between"><TrendingUp className="w-5 h-5 text-green-600" /><Badge variant="secondary">Balance</Badge></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ethBalance.substring(0, 8)} ETH</div>
              <p className="text-sm text-gray-600">Available for Purchase</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between"><ShoppingCart className="w-5 h-5 text-purple-600" /><Badge variant="secondary">Market</Badge></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listings.length}</div>
              <p className="text-sm text-gray-600">Active Listings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between"><Leaf className="w-5 h-5 text-emerald-600" /><Badge variant="secondary">Supply</Badge></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listings.reduce((sum, l) => sum + l.credits, 0)}</div>
              <p className="text-sm text-gray-600">Credits Available</p>
            </CardContent>
          </Card>
        </div>

        {lastTx && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4 text-sm text-green-800 flex items-center gap-2">
              Last purchase transaction:
              {getTxUrl(lastTx) ? (
                <a className="underline inline-flex items-center gap-1" href={getTxUrl(lastTx)} target="_blank" rel="noreferrer">
                  {lastTx.slice(0, 18)}… <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="font-mono">{lastTx}</span>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Marketplace Listings</CardTitle>
            <CardDescription>Credits issued on-chain after auditor approval and listed by the NGO. Prices are in ETH.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <div className="flex justify-center py-8 text-gray-500"><Loader className="w-5 h-5 animate-spin mr-2" />Loading listings…</div>
            )}
            {!loading && listings.length === 0 && (
              <p className="text-center py-8 text-gray-500">
                No credits are listed yet. Listings appear here after an auditor approves an NGO project.
              </p>
            )}
            {listings.map(listing => (
              <Card key={listing.id} className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{listing.projectName}</CardTitle>
                      <CardDescription>{listing.ngoName}</CardDescription>
                    </div>
                    <Badge variant="secondary">{listing.ecosystem}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" />{listing.location}</div>
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" />Vintage {listing.vintage}</div>
                      <p className="text-gray-600">{listing.description}</p>
                      <p className="text-xs text-gray-500">{listing.certification}</p>
                      {listing.mintTxHash && getTxUrl(listing.mintTxHash) && (
                        <a className="text-xs underline text-blue-700" href={getTxUrl(listing.mintTxHash)} target="_blank" rel="noreferrer">
                          Issuance transaction
                        </a>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className="text-gray-600">Price per credit</span><span className="font-bold text-lg">{listing.pricePerCredit} ETH</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Available</span><span className="font-semibold">{listing.credits} credits</span></div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="1"
                          max={listing.credits}
                          aria-label={`Quantity for ${listing.projectName}`}
                          value={quantities[listing.id] ?? '1'}
                          onChange={e => setQuantities({ ...quantities, [listing.id]: e.target.value })}
                        />
                        <Button onClick={() => handlePurchase(listing)} disabled={purchasing === listing.id} className="whitespace-nowrap">
                          {purchasing === listing.id ? (<><Loader className="w-4 h-4 animate-spin mr-2" />Confirm in MetaMask…</>) : 'Buy Credits'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
