// Quick test to verify Sepolia blockchain connection works
console.log('🧪 Testing Sepolia Blockchain Connection...');

// Check if we can connect to MetaMask
if (typeof window !== 'undefined' && window.ethereum) {
  console.log('✅ MetaMask detected');
  
  // Test connection
  window.ethereum.request({ method: 'eth_requestAccounts' })
    .then(accounts => {
      console.log('👤 Connected accounts:', accounts);
      
      // Check if we're on Sepolia
      return window.ethereum.request({ method: 'eth_chainId' });
    })
    .then(chainId => {
      console.log('🌐 Chain ID:', chainId);
      
      if (chainId === '0xaa36a7') {
        console.log('✅ Connected to Sepolia testnet!');
        
        // Test token contract
        const contractAddress = '0x025614e8Dc0b1eb488604D6f6C85982b85f9665B';
        console.log('🔗 Testing contract at:', contractAddress);
        
        // Import ethers (assumes it's available)
        if (typeof ethers !== 'undefined') {
          const provider = new ethers.BrowserProvider(window.ethereum);
          provider.getCode(contractAddress)
            .then(code => {
              if (code !== '0x') {
                console.log('✅ Contract deployed and accessible!');
                console.log('🎉 BLOCKCHAIN IS READY FOR REAL TRANSACTIONS!');
              } else {
                console.log('❌ Contract not found at address');
              }
            })
            .catch(err => console.log('⚠️ Contract check failed:', err));
        }
      } else {
        console.log('⚠️ Not on Sepolia testnet. Current chain:', chainId);
        console.log('💡 Please switch to Sepolia testnet in MetaMask');
      }
    })
    .catch(err => {
      console.log('❌ Connection failed:', err);
    });
} else {
  console.log('❌ MetaMask not detected');
}

export {}; // Make this a module