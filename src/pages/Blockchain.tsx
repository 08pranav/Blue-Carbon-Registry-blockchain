import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BlockchainWallet } from '@/components/BlockchainWallet';
import { BlockchainTransactions } from '@/components/BlockchainTransactions';
import { 
  Zap, 
  Shield, 
  Globe, 
  Code, 
  ExternalLink,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

const BlockchainPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Blockchain Integration
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Interact with Blue Carbon smart contracts deployed on Sepolia testnet. 
            Register organizations, verify projects, and trade carbon credits on the blockchain.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="outline" className="text-green-700 border-green-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              Sepolia Testnet
            </Badge>
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              <Shield className="w-3 h-3 mr-1" />
              Smart Contracts Deployed
            </Badge>
            <Badge variant="outline" className="text-purple-700 border-purple-300">
              <Globe className="w-3 h-3 mr-1" />
              Decentralized
            </Badge>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-700">
                <Shield className="w-5 h-5" />
                <span>Immutable Registry</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-600">
                All project registrations and verifications are permanently recorded on the blockchain, 
                ensuring transparency and preventing fraud.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <TrendingUp className="w-5 h-5" />
                <span>Carbon Credits</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-600">
                Verified carbon credits are minted as ERC-20 tokens (BCC) that can be traded, 
                transferred, or retired for carbon offsetting.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-700">
                <Globe className="w-5 h-5" />
                <span>Decentralized Trading</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-600">
                Execute peer-to-peer trades directly on the blockchain without intermediaries, 
                with automatic settlement and proof of transaction.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Connection */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <BlockchainWallet />
          </div>
          
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="w-5 h-5" />
                  <span>Smart Contract Details</span>
                </CardTitle>
                <CardDescription>
                  Information about deployed contracts on Sepolia testnet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">CarbonCreditToken (BCC)</h4>
                    <p className="text-sm text-gray-600 mb-2">ERC-20 token for carbon credits</p>
                    <div className="text-xs font-mono text-gray-500 break-all">
                      Coming soon after deployment...
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary" className="text-xs">ERC-20</Badge>
                      <Badge variant="secondary" className="text-xs">Mintable</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">Marketplace</h4>
                    <p className="text-sm text-gray-600 mb-2">Registry and trading contract</p>
                    <div className="text-xs font-mono text-gray-500 break-all">
                      Coming soon after deployment...
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary" className="text-xs">Registry</Badge>
                      <Badge variant="secondary" className="text-xs">Trading</Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-3">Quick Links</h4>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://sepolia.etherscan.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Sepolia Explorer</span>
                    </a>
                    <a
                      href="https://sepoliafaucet.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Get Sepolia ETH</span>
                    </a>
                    <a
                      href="https://metamask.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>MetaMask</span>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Blockchain Transactions */}
        <BlockchainTransactions />

        {/* Status and Instructions */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-700">
              <Clock className="w-5 h-5" />
              <span>Getting Started</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-yellow-700 mb-2">Prerequisites</h4>
                <ul className="space-y-1 text-sm text-yellow-600">
                  <li>• Install MetaMask browser extension</li>
                  <li>• Switch to Sepolia testnet</li>
                  <li>• Get Sepolia ETH from faucet</li>
                  <li>• Connect wallet to this application</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-yellow-700 mb-2">Next Steps</h4>
                <ul className="space-y-1 text-sm text-yellow-600">
                  <li>• Deploy contracts to Sepolia (see instructions below)</li>
                  <li>• Update contract addresses in config</li>
                  <li>• Test NGO registration and verification</li>
                  <li>• Execute carbon credit trades</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlockchainPage;