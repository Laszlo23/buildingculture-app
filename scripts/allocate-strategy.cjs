#!/usr/bin/env node
/**
 * Allocate strategy bps + set adapter on StrategyRegistry.
 *
 * Required: DEPLOY_PRIVATE_KEY or PRIVATE_KEY.
 * Optional env: RPC_URL, STRATEGY_REGISTRY, VAULT_CONTRACT, STRATEGY_ID (default 1), ALLOCATION_BPS (default 500).
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
const ALLOCATION_BPS = Number(process.env.ALLOCATION_BPS ?? 500);

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(mustKey(), provider);

  const abi = [
    'function allocate(uint256 strategyId, uint256 bps) external',
    'function setStrategyAdapter(uint256 strategyId, address adapter) external',
    'function strategyCount() external view returns (uint256)',
    'function owner() external view returns (address)',
  ];

  const registry = new ethers.Contract(STRATEGY_REGISTRY, abi, wallet);

  console.log('StrategyRegistry:', STRATEGY_REGISTRY);
  console.log('Current owner:', await registry.owner());

  console.log(`Allocating ${ALLOCATION_BPS} bps to strategy ${STRATEGY_ID}...`);
  const tx1 = await registry.allocate(STRATEGY_ID, ALLOCATION_BPS);
  console.log('Allocate tx:', tx1.hash);
  await tx1.wait();
  console.log('✅ Allocated');

  console.log(`Setting adapter for strategy ${STRATEGY_ID} to ${VAULT_CONTRACT}...`);
  const tx2 = await registry.setStrategyAdapter(STRATEGY_ID, VAULT_CONTRACT);
  console.log('SetAdapter tx:', tx2.hash);
  await tx2.wait();
  console.log('✅ Adapter set');

  console.log('\n🎉 Strategy registered successfully!');
  console.log(`Strategy ID: ${STRATEGY_ID}`);
  console.log(`Allocation: ${ALLOCATION_BPS} bps (${ALLOCATION_BPS / 100}%)`);
  console.log(`Adapter: ${VAULT_CONTRACT}`);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
