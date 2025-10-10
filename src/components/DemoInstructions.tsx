import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { FIXED_WALLETS } from '../utils/fixedWallets';
import { CheckCircle, Video, Wallet, Globe, ShoppingCart } from 'lucide-react';

export default function DemoInstructions() {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Video className="w-6 h-6 text-blue-600" />
          <CardTitle className="text-blue-800">🎬 Demo Video Recording Guide</CardTitle>
        </div>
        <CardDescription className="text-blue-700">
          Follow these steps for a perfect blockchain demo video
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <Badge className="bg-blue-100 text-blue-800">1</Badge>
          </div>
          <div>
            <h3 className="font-semibold text-blue-800 flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Setup MetaMask
            </h3>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Open MetaMask extension</li>
              <li>• Switch to <strong>Sepolia Testnet</strong></li>
              <li>• Import Company wallet: <code className="bg-blue-100 px-1 rounded text-xs">{FIXED_WALLETS.COMPANY}</code></li>
              <li>• Ensure you have some Sepolia ETH for gas fees</li>
            </ul>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <Badge className="bg-green-100 text-green-800">2</Badge>
          </div>
          <div>
            <h3 className="font-semibold text-green-800 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Login as Company
            </h3>
            <ul className="text-sm text-green-700 mt-2 space-y-1">
              <li>• Go to login page</li>
              <li>• Select "COMPANY" role</li>
              <li>• Use any company name (e.g., "Green Corp")</li>
              <li>• Access the Company Dashboard</li>
            </ul>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <Badge className="bg-purple-100 text-purple-800">3</Badge>
          </div>
          <div>
            <h3 className="font-semibold text-purple-800 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Purchase Carbon Credits
            </h3>
            <ul className="text-sm text-purple-700 mt-2 space-y-1">
              <li>• Browse available carbon credit projects</li>
              <li>• Select quantity (start with 1-5 credits)</li>
              <li>• Click "Buy Credits" button</li>
              <li>• Confirm transaction in MetaMask popup</li>
              <li>• Wait for confirmation (2-3 minutes)</li>
            </ul>
          </div>
        </div>

        {/* Expected Results */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4" />
            What You'll See in the Video
          </h3>
          <ul className="text-sm text-green-700 space-y-2">
            <li>✅ <strong>ETH Balance Decrease:</strong> Company wallet ETH reduces by purchase amount</li>
            <li>✅ <strong>BCC Token Increase:</strong> Company receives carbon credit tokens</li>
            <li>✅ <strong>NGO ETH Increase:</strong> NGO wallet receives ETH payment</li>
            <li>✅ <strong>Real Transaction Hashes:</strong> View on Sepolia Etherscan</li>
            <li>✅ <strong>Balance Updates:</strong> Live wallet balance changes</li>
          </ul>
        </div>

        {/* Pro Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-3">🎯 Pro Recording Tips</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Keep MetaMask window visible during recording</li>
            <li>• Show before/after wallet balances</li>
            <li>• Open Sepolia Etherscan in another tab to verify transactions</li>
            <li>• Refresh the dashboard after transaction to show updated balances</li>
            <li>• Record the entire flow from login to purchase completion</li>
          </ul>
        </div>

        {/* Wallet Addresses */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">📋 Wallet Addresses for Demo</h3>
          <div className="space-y-2 text-sm font-mono">
            <div><strong>Company:</strong> {FIXED_WALLETS.COMPANY}</div>
            <div><strong>NGO:</strong> {FIXED_WALLETS.NGO}</div>
            <div><strong>Auditor:</strong> {FIXED_WALLETS.AUDITOR}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}