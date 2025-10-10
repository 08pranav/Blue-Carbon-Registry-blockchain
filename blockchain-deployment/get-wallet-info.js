import { ethers } from 'ethers';
import 'dotenv/config';

async function getWalletInfo() {
    try {
        const wallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY);
        console.log('=====================================');
        console.log('🔑 WALLET INFORMATION');
        console.log('=====================================');
        console.log('📧 Wallet Address:', wallet.address); 
        console.log('🌐 Network: Sepolia Testnet');
        console.log('=====================================');
        console.log('\n💰 GET SEPOLIA ETH FROM THESE FAUCETS:');
        console.log('1. https://sepoliafaucet.com/');
        console.log('2. https://faucet.sepolia.dev/');
        console.log('3. https://sepolia-faucet.pk910.de/');
        console.log('4. https://www.alchemy.com/faucets/ethereum-sepolia');
        console.log('5. https://cloud.google.com/application/web3/faucet/ethereum/sepolia');
        console.log('\n📋 INSTRUCTIONS:');
        console.log('1. Copy your wallet address above');
        console.log('2. Visit any of the faucet links');
        console.log('3. Paste your address and request ETH');
        console.log('4. Wait for confirmation (usually 1-2 minutes)');
        console.log('5. Run: npm run check-balance');
        console.log('=====================================');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

getWalletInfo();