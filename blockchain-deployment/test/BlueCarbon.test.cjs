const { expect } = require("chai");
const { ethers } = require("hardhat");

// End-to-end tests for the Blue Carbon Registry contracts.
// Mirrors the app flow: NGO registers -> auditor verifies & mints BCC ->
// NGO approves marketplace -> company buys credits with ETH.
describe("Blue Carbon Registry", function () {
  let admin, ngo, company, stranger, token, marketplace;
  const BCC = (n) => ethers.parseEther(String(n));

  beforeEach(async () => {
    [admin, ngo, company, stranger] = await ethers.getSigners();
    token = await (await ethers.getContractFactory("CarbonCreditToken")).deploy(admin.address);
    marketplace = await (await ethers.getContractFactory("Marketplace")).deploy(await token.getAddress());
  });

  describe("CarbonCreditToken", () => {
    it("has the right name/symbol and starts with zero supply", async () => {
      expect(await token.name()).to.equal("Blue Carbon Credit");
      expect(await token.symbol()).to.equal("BCC");
      expect(await token.totalSupply()).to.equal(0n);
    });

    it("lets only the owner (auditor/admin) mint", async () => {
      await token.mint(ngo.address, BCC(100));
      expect(await token.balanceOf(ngo.address)).to.equal(BCC(100));
      await expect(token.connect(stranger).mint(stranger.address, 1))
        .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("lets holders burn (retire) their credits", async () => {
      await token.mint(company.address, BCC(10));
      await token.connect(company).burn(BCC(4));
      expect(await token.balanceOf(company.address)).to.equal(BCC(6));
    });
  });

  describe("Marketplace registry", () => {
    it("registers an NGO as Pending and blocks duplicates", async () => {
      await expect(marketplace.registerNGO(ngo.address, "Mangrove Trust", "ipfs://docs"))
        .to.emit(marketplace, "NGORegistered").withArgs(1, ngo.address, "Mangrove Trust");
      const rec = await marketplace.getNgoById(1);
      expect(rec.status).to.equal(1); // Pending
      await expect(marketplace.registerNGO(ngo.address, "Again", "x")).to.be.revertedWith("already registered");
    });

    it("only admin can verify an NGO", async () => {
      await marketplace.registerNGO(ngo.address, "Mangrove Trust", "ipfs://docs");
      await expect(marketplace.connect(stranger).verifyNGO(1, 2, 0)).to.be.revertedWith("only admin");
      await marketplace.verifyNGO(1, 2, 0);
      expect((await marketplace.getNgoById(1)).status).to.equal(2); // Verified
    });

    it("mints on verification once the marketplace owns the token", async () => {
      await token.transferOwnership(await marketplace.getAddress());
      await marketplace.registerNGO(ngo.address, "Mangrove Trust", "ipfs://docs");
      await expect(marketplace.verifyNGO(1, 2, BCC(250)))
        .to.emit(marketplace, "CreditsMinted").withArgs(1, ngo.address, BCC(250));
      expect(await token.balanceOf(ngo.address)).to.equal(BCC(250));
    });

    it("registers companies", async () => {
      await expect(marketplace.registerCompany(company.address, "GreenCo", "kyc"))
        .to.emit(marketplace, "CompanyRegistered").withArgs(1, company.address, "GreenCo");
    });
  });

  describe("Trading", () => {
    beforeEach(async () => {
      await token.mint(ngo.address, BCC(100)); // auditor mints after verification
    });

    it("reverts if the NGO has not approved the marketplace", async () => {
      await expect(
        marketplace.connect(company).executeTrade(ngo.address, company.address, BCC(10), "pdf", { value: BCC(0.01) })
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance");
    });

    it("moves BCC to the company and ETH to the NGO", async () => {
      await token.connect(ngo).approve(await marketplace.getAddress(), BCC(10));
      const price = BCC(0.01);
      const before = await ethers.provider.getBalance(ngo.address);

      await expect(
        marketplace.connect(company).executeTrade(ngo.address, company.address, BCC(10), "ipfs://contract.pdf", { value: price })
      ).to.emit(marketplace, "TradeExecuted");

      expect(await token.balanceOf(company.address)).to.equal(BCC(10));
      expect(await token.balanceOf(ngo.address)).to.equal(BCC(90));
      expect(await ethers.provider.getBalance(ngo.address)).to.equal(before + price);

      const trade = await marketplace.getTradeById(1);
      expect(trade.buyer).to.equal(company.address);
      expect(trade.price).to.equal(price);
    });

    it("requires payment and a positive amount", async () => {
      await token.connect(ngo).approve(await marketplace.getAddress(), BCC(10));
      await expect(marketplace.connect(company).executeTrade(ngo.address, company.address, BCC(1), "x"))
        .to.be.revertedWith("payment required");
      await expect(marketplace.connect(company).executeTrade(ngo.address, company.address, 0, "x", { value: 1 }))
        .to.be.revertedWith("amount must be > 0");
    });
  });
});
