import { ethers } from 'ethers';
import 'dotenv/config';

async function checkBalance() {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);
        
        console.log('=====================================');
        console.log('💰 CHECKING SEPOLIA BALANCE');
        console.log('=====================================');
        console.log('📧 Wallet Address:', wallet.address);
        
        const balance = await provider.getBalance(wallet.address);
        const balanceInEth = ethers.formatEther(balance);
        
        console.log('💳 Balance:', balanceInEth, 'ETH');
        
        if (parseFloat(balanceInEth) === 0) {
            console.log('❌ No ETH found!');
            console.log('\n🚰 REQUEST ETH FROM FAUCETS:');
            console.log('1. https://sepoliafaucet.com/');
            console.log('2. https://faucet.sepolia.dev/');
            console.log('3. https://sepolia-faucet.pk910.de/');
            console.log('4. https://www.alchemy.com/faucets/ethereum-sepolia');
            console.log('\n📋 Steps:');
            console.log('1. Copy wallet address:', wallet.address);
            console.log('2. Visit faucet and paste address');
            console.log('3. Request ETH (usually 0.1-1 ETH per request)');
            console.log('4. Wait 1-2 minutes for confirmation');
            console.log('5. Run this command again to check');
        } else if (parseFloat(balanceInEth) < 0.01) {
            console.log('⚠️  Low balance! You might need more ETH for deployment.');
            console.log('💡 Minimum recommended: 0.01 ETH for contract deployment');
        } else {
            console.log('✅ Sufficient balance for deployment!');
            console.log('🚀 You can now run: npm run deploy:sepolia');
        }
        
        console.log('=====================================');
        console.log('🔍 View on Etherscan:');
        console.log(`https://sepolia.etherscan.io/address/${wallet.address}`);
        console.log('=====================================');
        
    } catch (error) {
        console.error('❌ Error checking balance:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check your SEPOLIA_PRIVATE_KEY in .env file');
        console.log('2. Ensure you have internet connection');
        console.log('3. Try again in a few moments');
    }
}

checkBalance();