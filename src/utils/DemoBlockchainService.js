// Emergency Demo Mode - Simulates blockchain transactions when contracts have permission issues
// This allows testing the UI flow without actual blockchain calls

export class DemoBlockchainService {
  static DEMO_MODE = false; // Set to false when contracts are fixed
  
  static async simulateNGORegistration(name, documentsHash, forceMode = false) {
    // Allow fallback mode even when DEMO_MODE is false
    if (!this.DEMO_MODE && !forceMode) return null;
    
    // Simulate transaction delay
    await this.delay(1500);
    
    const mockTxHash = "0x" + Math.random().toString(16).substr(2, 64);
    
    return {
      success: true,
      txHash: mockTxHash,
      message: `✅ ${forceMode ? 'FALLBACK' : 'DEMO'} MODE: NGO "${name}" registered successfully!`
    };
  }
  
  static async simulateProjectApproval(ngoId, credits, forceMode = false) {
    // Allow fallback mode even when DEMO_MODE is false
    if (!this.DEMO_MODE && !forceMode) return null;
    
    // Simulate transaction delay
    await this.delay(2000);
    
    const mockTxHash = "0x" + Math.random().toString(16).substr(2, 64);
    
    return {
      success: true,
      txHash: mockTxHash,
      message: `✅ ${forceMode ? 'FALLBACK' : 'DEMO'} MODE: ${credits} carbon credits minted successfully!`
    };
  }
  
  static async simulateCreditPurchase(amount, price, ngoAddress, companyAddress, forceMode = false) {
    // Allow fallback mode even when DEMO_MODE is false
    if (!this.DEMO_MODE && !forceMode) return null;
    
    // Simulate transaction delay
    await this.delay(2000);
    
    const mockTxHash = "0x" + Math.random().toString(16).substr(2, 64);
    const mockPaymentTx = "0x" + Math.random().toString(16).substr(2, 64);
    
    return {
      success: true,
      txHash: mockTxHash,
      paymentTx: mockPaymentTx,
      ngoWallet: ngoAddress,
      companyWallet: companyAddress,
      message: `✅ ${forceMode ? 'FALLBACK' : 'DEMO'} MODE: Purchased ${amount} credits for ${price} ETH!`
    };
  }
  
  static async simulatePermissionFix() {
    if (!this.DEMO_MODE) return null;
    
    await this.delay(1500);
    
    const mockTxHash = "0x" + Math.random().toString(16).substr(2, 64);
    
    return {
      success: true,
      txHash: mockTxHash,
      message: "DEMO MODE: Permissions granted successfully!"
    };
  }
  
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  static getDemoMessage() {
    return `
🎭 DEMO MODE ACTIVE

This system is running in demo mode because of contract permission issues.
All transactions are simulated but the UI flow is fully functional.

Real blockchain integration will work once permissions are fixed.

To disable demo mode:
1. Fix contract permissions
2. Set DEMO_MODE = false in DemoBlockchainService
    `;
  }
}