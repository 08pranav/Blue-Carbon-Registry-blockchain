import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, Info } from 'lucide-react';
import { DemoBlockchainService } from '../utils/DemoBlockchainService.js';

const DemoModeBanner = () => {
  if (!DemoBlockchainService.DEMO_MODE) return null;

  return (
    <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              🎭
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                DEMO MODE
              </Badge>
              <span className="text-sm font-medium text-blue-800">
                Blockchain Simulation Active
              </span>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              This system is running in demonstration mode. All blockchain transactions are simulated 
              but the complete user workflow is functional. Real blockchain integration will be activated 
              once smart contract permissions are configured properly.
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <Info className="w-4 h-4" />
              <span>All data and transactions are for demonstration purposes only</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoModeBanner;