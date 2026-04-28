#!/usr/bin/env node
/**
 * Read-only: StrategyRegistry allocation + adapter for a strategy ID.
 *
 * Usage: node -r dotenv/config scripts/check-strategy.cjs
 * Env: RPC_URL (optional), STRATEGY_REGISTRY (optional), STRATEGY_ID (default 1).
 */

const { ethers } = require('ethers');

require('dotenv').config();

const RPC_URL =
  process.env.RPC_URL?.trim() ||
  process.env.BASE_RPC_URL?.trim() ||
  'https://mainnet.base.org';
const STRATEGY_REGISTRY =
  process.env.STRATEGY_REGISTRY?.trim() ||
  process.env.VITE_STRATEGY_REGISTRY?.trim() ||
  '0xE1B813bdDe4cedE9FeBE7a67a8065126cb867338';
const STRATEGY_ID = Number(process.env.STRATEGY_ID || 1);

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const abi = [
    'function allocationBps(uint256) view returns (uint256)',
    'function strategyAdapter(uint256) view returns (address)',
  ];

  const registry = new ethers.Contract(STRATEGY_REGISTRY, abi, provider);

  const allocationBN = await registry.allocationBps(STRATEGY_ID);
  const adapter = await registry.strategyAdapter(STRATEGY_ID);

  const allocation = allocationBN.toString();
  const allocationPct = Number(allocation) / 100;

  console.log(`Strategy ${STRATEGY_ID} allocation: ${allocation} bps (${allocationPct}% )`);
  console.log(`Strategy ${STRATEGY_ID} adapter: ${adapter}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
