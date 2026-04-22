/**
 * Deploy VillaPocBondingCurve (USDC bonding curve + receipt ERC-20).
 *
 * Base Sepolia: npx hardhat run scripts/deploy-villa-bonding-curve.cjs --network baseSepolia
 * Base mainnet: npx hardhat run scripts/deploy-villa-bonding-curve.cjs --network base
 *
 * Env:
 *   VILLA_POC_BENEFICIARY — address receiving USDC (required on mainnet for production; defaults to deployer with warning)
 *   VILLA_POC_USDC — override USDC address (mainnet defaults to canonical Base USDC)
 *   VILLA_POC_P0_MICRO — micro-USDC per full token at S=0 (default 1_000_000 = 1 USDC per token)
 *   VILLA_POC_ALPHA_MICRO — curve steepness (default 100)
 *   VILLA_POC_MAX_SUPPLY_WEI — max total supply wei (default 100e6 ether)
 */
const hre = require("hardhat");

const BASE_MAINNET_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

async function txOpts(chainId, multPercent = 200) {
  if (chainId !== 8453) return {};
  const fee = await hre.ethers.provider.getFeeData();
  const m = BigInt(multPercent);
  const bump = x => (x ? (x * m) / 100n : undefined);
  const o = {
    maxFeePerGas: bump(fee.maxFeePerGas),
    maxPriorityFeePerGas: bump(fee.maxPriorityFeePerGas),
  };
  if (!o.maxFeePerGas) delete o.maxFeePerGas;
  if (!o.maxPriorityFeePerGas) delete o.maxPriorityFeePerGas;
  return o;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const net = await hre.ethers.provider.getNetwork();
  const chainId = Number(net.chainId);
  const opts = await txOpts(chainId, 200);

  console.log("Deployer:", deployer.address);
  console.log("Chain ID:", chainId);

  let usdcAddr;
  if (chainId === 8453) {
    usdcAddr = (process.env.VILLA_POC_USDC || BASE_MAINNET_USDC).trim();
    console.log("Using USDC at:", usdcAddr);
  } else {
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const token = await MockERC20.deploy("Mock USDC", "mUSDC", 6, opts);
    await token.waitForDeployment();
    usdcAddr = await token.getAddress();
    console.log("Deployed MockERC20 (6 dec) for test USDC:", usdcAddr);
    if (chainId === 84532) await sleep(800);
    const mintAmt = 10_000_000n * 10n ** 6n;
    await (await token.mint(deployer.address, mintAmt)).wait();
    console.log("Minted test USDC to deployer:", mintAmt.toString());
  }

  const beneficiary =
    (process.env.VILLA_POC_BENEFICIARY && process.env.VILLA_POC_BENEFICIARY.trim()) || deployer.address;
  if (chainId === 8453 && !process.env.VILLA_POC_BENEFICIARY) {
    console.warn("\n*** WARNING: VILLA_POC_BENEFICIARY unset — USDC sale proceeds go to the deployer address. ***\n");
  }

  const p0Micro = process.env.VILLA_POC_P0_MICRO ? BigInt(process.env.VILLA_POC_P0_MICRO) : 1_000_000n;
  const alphaMicro = process.env.VILLA_POC_ALPHA_MICRO ? BigInt(process.env.VILLA_POC_ALPHA_MICRO) : 100n;
  const maxSupplyTokens = process.env.VILLA_POC_MAX_SUPPLY_WEI
    ? BigInt(process.env.VILLA_POC_MAX_SUPPLY_WEI)
    : hre.ethers.parseEther("100000000");

  const Factory = await hre.ethers.getContractFactory("VillaPocBondingCurve");
  const curve = await Factory.deploy(
    usdcAddr,
    beneficiary,
    deployer.address,
    "Villa Ebreichsdorf POC",
    "vEBR",
    p0Micro,
    alphaMicro,
    maxSupplyTokens,
    opts,
  );
  await curve.waitForDeployment();
  const curveAddr = await curve.getAddress();
  console.log("VillaPocBondingCurve:", curveAddr);

  console.log("\n--- Vite / public UI (.env) ---\n");
  console.log(`VITE_VILLA_BONDING_CURVE_ADDRESS=${curveAddr}`);
  if (process.env.VILLA_POC_USDC || chainId !== 8453) {
    console.log(`VITE_VILLA_BONDING_USDC_ADDRESS=${usdcAddr}`);
  } else {
    console.log("# VITE_VILLA_BONDING_USDC_ADDRESS optional on Base mainnet (defaults to canonical USDC in app)");
  }
  console.log(`# Match wallet network: VITE_CHAIN_ID=${chainId}`);

  if (chainId === 8453) {
    console.log("\nMainnet: verify contract on Basescan; get legal review before promoting the sale.");
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
