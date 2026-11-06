// Shared deployment logic used by deploy-local.js, deploy-sepolia.js and the test suite,
// so that what we test is exactly what we deploy.
//
// Ownership design: the Marketplace owns the CarbonCreditToken. The only way to mint
// BCC is Marketplace.verifyNGO(), which only the Marketplace admin (the deployer, i.e.
// the auditor wallet) can call. Every issuance therefore emits CreditsMinted and updates
// the NGO's creditsAllocated record.
async function deployCore(ethers, deployer) {
  const token = await (await ethers.getContractFactory("CarbonCreditToken")).deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  const marketplace = await (await ethers.getContractFactory("Marketplace")).deploy(tokenAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();

  const tx = await token.transferOwnership(marketplaceAddress);
  await tx.wait();

  return { token, marketplace, tokenAddress, marketplaceAddress, transferOwnershipTx: tx.hash };
}

module.exports = { deployCore };
