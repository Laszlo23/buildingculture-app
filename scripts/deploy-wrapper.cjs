// scripts/deploy-wrapper.cjs
// Deploy the StrategyRegistryWrapper contract using pre-compiled ABI + bytecode.
//
// Required: DEPLOYER_PRIVATE_KEY (0x… deployer wallet). Optional: BASE_RPC_URL, STRATEGY_REGISTRY_ADDRESS.
// Usage: DOTENV_CONFIG_PATH=.env node -r dotenv/config scripts/deploy-wrapper.cjs

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY?.trim();
const RPC_URL = process.env.BASE_RPC_URL?.trim() || 'https://mainnet.base.org';
const REGISTRY_ADDRESS =
  process.env.STRATEGY_REGISTRY_ADDRESS?.trim() || '0xE1B813bdDe4cedE9FeBE7a67a8065126cb867338';

if (!PRIVATE_KEY || !/^0x[a-fA-F0-9]{64}$/.test(PRIVATE_KEY)) {
  console.error('Set DEPLOYER_PRIVATE_KEY in .env (0x + 64 hex). Never commit real keys.');
  process.exit(1);
}

const ARTIFACT_DIR = path.join(__dirname, '../artifacts/wrapper');
const ABI_FILE  = path.join(ARTIFACT_DIR, '_Users_poker_vibe_onyx-stride-collective-main_contracts_StrategyRegistryWrapper_sol_StrategyRegistryWrapper.abi');
const BIN_FILE  = path.join(ARTIFACT_DIR, '_Users_poker_vibe_onyx-stride-collective-main_contracts_StrategyRegistryWrapper_sol_StrategyRegistryWrapper.bin');

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const abi      = JSON.parse(fs.readFileSync(ABI_FILE, 'utf8'));
  const bytecode = '0x' + fs.readFileSync(BIN_FILE, 'utf8').trim();

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  console.log('Deploying StrategyRegistryWrapper...');
  console.log('Registry address:', REGISTRY_ADDRESS);

  const contract = await factory.deploy(REGISTRY_ADDRESS);
  const receipt = await contract.deploymentTransaction().wait();
  const address = await contract.getAddress();

  console.log('✅ Deployed at:', address);
  console.log('Tx hash:', receipt.hash);
  console.log('\nSave this address – use it to call registerStrategy() for future vaults.');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
