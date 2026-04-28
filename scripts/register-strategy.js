// scripts/register-strategy.js
// Hardhat script to register a new yield‑vault strategy in StrategyRegistry
// ---------------------------------------------------------------
// Prerequisites:
//   - .env contains PRIVATE_KEY, RPC_URL, STRATEGY_REGISTRY, VAULT_CONTRACT, ASSET_TOKEN, etc.
//   - Hardhat is configured (hardhat.config.ts) to use the Base mainnet RPC_URL.
//   - Deployer address must have enough ETH for gas.

const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from", deployer.address);

  const registryAddr = process.env.STRATEGY_REGISTRY;
  const vaultAddr = process.env.VAULT_CONTRACT;
  const assetAddr = process.env.ASSET_TOKEN;

  if (!registryAddr || !vaultAddr || !assetAddr) {
    throw new Error("Missing required env vars: STRATEGY_REGISTRY, VAULT_CONTRACT, ASSET_TOKEN");
  }

  const StrategyRegistry = await ethers.getContractAt(
    "IStrategyRegistry",
    registryAddr,
    deployer
  );

  const name = "RWA_USDC_Yield_V1";
  const managementFeeBps = 150; // 1.5%
  const performanceFeeBps = 1000; // 10%
  const minDeposit = ethers.parseUnits("100", Number(process.env.ASSET_DECIMALS || 6));

  console.log("Registering strategy…");
  const tx = await StrategyRegistry.registerStrategy(
    name,
    vaultAddr,
    assetAddr,
    managementFeeBps,
    performanceFeeBps,
    minDeposit
  );

  console.log("Tx sent:", tx.hash);
  await tx.wait();
  console.log("✅ Strategy registered successfully");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
