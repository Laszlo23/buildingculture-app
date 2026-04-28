#!/usr/bin/env node
/**
 * Set StrategyRegistry adapter for a strategy ID.
 *
 * Required: DEPLOY_PRIVATE_KEY or PRIVATE_KEY, STRATEGY_REGISTRY, VAULT_CONTRACT (adapter target).
 * Optional: RPC_URL, STRATEGY_ID (default 1).
 */

const { ethers } = require('ethers');

require('dotenv').config();

function mustKey() {
  const k =
    process.env.DEPLOY_PRIVATE_KEY?.trim() ||
    process.env.PRIVATE_KEY?.trim();
  if (!k || !/^0x[a-fA-F0-9]{64}$/.test(k)) {
    console.error('Set DEPLOY_PRIVATE_KEY or PRIVATE_KEY in .env. Never commit keys.');
    process.exit(1);
  }
  return k;
}

const RPC_URL =
  process.env.RPC_URL?.trim() ||
  process.env.BASE_RPC_URL?.trim() ||
  'https://mainnet.base.org';
const STRATEGY_REGISTRY =
  process.env.STRATEGY_REGISTRY?.trim() ||
  process.env.VITE_STRATEGY_REGISTRY?.trim() ||
  '0xE1B813bdDe4cedE9FeBE7a67a8065126cb867338';
const VAULT_CONTRACT =
  process.env.VAULT_CONTRACT?.trim() ||
  process.env.VITE_VAULT_CONTRACT?.trim() ||
  '0xe80ba69FA320800461dB236482a2e9578350c546';
const STRATEGY_ID = Number(process.env.STRATEGY_ID || 1);

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(mustKey(), provider);

  const abi = [
    'function setStrategyAdapter(uint256 strategyId, address adapter) external',
    'function owner() view returns (address)',
  ];

  const registry = new ethers.Contract(STRATEGY_REGISTRY, abi, wallet);

  console.log('Owner:', await registry.owner());
  console.log(`Setting adapter for strategy ${STRATEGY_ID} to ${VAULT_CONTRACT} ...`);

  const tx = await registry.setStrategyAdapter(STRATEGY_ID, VAULT_CONTRACT);
  console.log('Tx hash:', tx.hash);
  await tx.wait();
  console.log('✅ Adapter set!');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
