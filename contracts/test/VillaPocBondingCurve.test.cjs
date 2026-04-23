const { expect } = require("chai");

describe("VillaPocBondingCurve", function () {
  let ethers;

  before(async function () {
    const { default: hre } = await import("hardhat");
    ({ ethers } = await hre.network.create());
  });

  async function deployFixture() {
    const [owner, buyer, ben] = await ethers.getSigners();
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy("Mock USDC", "USDC", 6);
    await usdc.waitForDeployment();
    const usdcAddr = await usdc.getAddress();

    const p0 = 1_000_000n; // 1 USDC per full token
    const alpha = 0n;
    const maxSupply = ethers.parseEther("1000000");

    const Curve = await ethers.getContractFactory("VillaPocBondingCurve");
    const curve = await Curve.deploy(
      usdcAddr,
      ben.address,
      owner.address,
      "Villa POC",
      "vEBR",
      p0,
      alpha,
      maxSupply,
    );
    await curve.waitForDeployment();

    const fund = 1_000_000n * 10n ** 6n;
    await (await usdc.mint(buyer.address, fund)).wait();
    await (await usdc.connect(buyer).approve(await curve.getAddress(), fund)).wait();

    return { owner, buyer, ben, usdc, curve, p0, alpha };
  }

  it("mints tokens with linear p0 only (alpha=0)", async function () {
    const { buyer, ben, usdc, curve, p0 } = await deployFixture();
    const budget = 10n ** 6n; // 1 USDC
    const expectedOut = (budget * 10n ** 18n) / p0;
    const benBefore = await usdc.balanceOf(ben.address);
    await expect(curve.connect(buyer).buy(budget)).to.emit(curve, "Bought");
    expect(await curve.balanceOf(buyer.address)).to.equal(expectedOut);
    expect(await usdc.balanceOf(ben.address) - benBefore).to.equal(budget);
  });

  it("marginal price increases when alpha > 0", async function () {
    const [owner, buyer, ben] = await ethers.getSigners();
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy("Mock USDC", "USDC", 6);
    await usdc.waitForDeployment();
    const p0 = 100_000n; // 0.1 USDC per token
    const alpha = 50_000n; // steepness
    const maxSupply = ethers.parseEther("1000000");
    const Curve = await ethers.getContractFactory("VillaPocBondingCurve");
    const curve = await Curve.deploy(
      await usdc.getAddress(),
      ben.address,
      owner.address,
      "Villa POC",
      "vEBR",
      p0,
      alpha,
      maxSupply,
    );
    await curve.waitForDeployment();
    const fund = 100n * 10n ** 6n;
    await (await usdc.mint(buyer.address, fund)).wait();
    await (await usdc.connect(buyer).approve(await curve.getAddress(), fund)).wait();

    const p0m = await curve.marginalPriceMicro(0n);
    const s1 = ethers.parseEther("10");
    const p1 = await curve.marginalPriceMicro(s1);
    expect(p1).to.be.gt(p0m);
  });

  it("reverts when paused", async function () {
    const { owner, buyer, curve } = await deployFixture();
    await (await curve.connect(owner).setPaused(true)).wait();
    await expect(curve.connect(buyer).buy(10n ** 6n)).to.be.revertedWithCustomError(curve, "BondingCurvePaused");
  });
});
