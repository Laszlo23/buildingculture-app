/**
 * Deploy all OSC contracts using PRIVATE_KEY from .env.
 *
 * Base Sepolia: npx hardhat run scripts/deploy-base-sepolia.cjs --network baseSepolia
 * Base mainnet: npx hardhat run scripts/deploy-base-sepolia.cjs --network base
 */
const hre = require("hardhat");

/** Bump EIP-1559 fees on Base mainnet to avoid "replacement transaction underpriced" when mempool is busy */
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
  if (Object.keys(opts).length) console.log("Using fee overrides for mainnet:", opts);

  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const token = await MockERC20.deploy("Mock USDC", "mUSDC", 6, opts);
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("MockERC20:", tokenAddr);

  if (chainId === 8453) await sleep(1500);

  const mintAmount = 10_000_000n * 10n ** 6n;
  await (await token.mint(deployer.address, mintAmount, await txOpts(chainId, 200))).wait();
  console.log("Minted", mintAmount.toString(), "to deployer");

  if (chainId === 8453) await sleep(1500);

  const ClubTreasury = await hre.ethers.getContractFactory("ClubTreasury");
  const treasury = await ClubTreasury.deploy(tokenAddr, await txOpts(chainId, 200));
  await treasury.waitForDeployment();
  const treasuryAddr = await treasury.getAddress();
  console.log("ClubTreasury:", treasuryAddr);

  if (chainId === 8453) await sleep(1500);

  const SavingsVault = await hre.ethers.getContractFactory("SavingsVault");
  const vault = await SavingsVault.deploy(tokenAddr, await txOpts(chainId, 200));
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log("SavingsVault:", vaultAddr);

  if (chainId === 8453) await sleep(1500);

  const StrategyRegistry = await hre.ethers.getContractFactory("StrategyRegistry");
  const registry = await StrategyRegistry.deploy(7, deployer.address, await txOpts(chainId, 200));
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("StrategyRegistry:", registryAddr);

  if (chainId === 8453) await sleep(1500);

  const GovernanceDAO = await hre.ethers.getContractFactory("GovernanceDAO");
  const dao = await GovernanceDAO.deploy(deployer.address, await txOpts(chainId, 200));
  await dao.waitForDeployment();
  const daoAddr = await dao.getAddress();
  console.log("GovernanceDAO:", daoAddr);

  if (chainId === 8453) await sleep(1500);

  const treasuryFund = 100_000n * 10n ** 6n;
  await (await token.transfer(treasuryAddr, treasuryFund, await txOpts(chainId, 200))).wait();
  console.log("Funded treasury with", treasuryFund.toString());

  const oneM = 10n ** 6n;
  for (let i = 0; i < 7; i++) {
    if (chainId === 8453) await sleep(2000);
    const tvl = BigInt(1_000_000 + i * 100_000) * oneM;
    await (await registry.setStrategyTvl(i, tvl, await txOpts(chainId, 220))).wait();
  }
  if (chainId === 8453) await sleep(4000);
  await (await registry.allocate(0, 2800, await txOpts(chainId, 280))).wait();

  if (chainId === 8453) await sleep(2000);
  await (await dao.setVotingPower(deployer.address, hre.ethers.parseEther("1"), await txOpts(chainId, 250))).wait();
  console.log("DAO voting power set for deployer");

  const rpcHint =
    chainId === 8453
      ? process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org"
      : process.env.RPC_URL || "https://sepolia.base.org";

  console.log("\n--- Copy into .env ---\n");
  console.log(`RPC_URL=${rpcHint}`);
  console.log(`CHAIN_ID=${chainId}`);
  console.log(`VAULT_CONTRACT=${vaultAddr}`);
  console.log(`TREASURY_CONTRACT=${treasuryAddr}`);
  console.log(`DAO_CONTRACT=${daoAddr}`);
  console.log(`STRATEGY_REGISTRY=${registryAddr}`);
  console.log(`ASSET_TOKEN=${tokenAddr}`);
  console.log("ASSET_DECIMALS=6");

  if (chainId === 84532) {
    console.log("\nBase Sepolia faucet: https://docs.base.org/docs/tools/network-faucets/");
  } else if (chainId === 8453) {
    console.log("\nMainnet: ensure the deployer wallet holds ETH on Base for gas.");
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
