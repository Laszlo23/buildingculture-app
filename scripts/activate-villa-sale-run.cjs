#!/usr/bin/env node
/**
 * Unpause Villa POC curve + set beneficiary (writes on-chain).
 *
 * Required in .env: PRIVATE_KEY or DEPLOY_PRIVATE_KEY, VILLA_POC_BENEFICIARY,
 * and curve address via VITE_VILLA_BONDING_CURVE_ADDRESS or VILLA_POC_BONDING_CURVE.
 * Optional: RPC_URL or BASE_RPC_URL (default https://mainnet.base.org).
 *
 * Usage: node -r dotenv/config scripts/activate-villa-sale-run.cjs
 */

const { ethers } = require('ethers');

require('dotenv').config();

function mustKey() {
  const k =
    process.env.DEPLOY_PRIVATE_KEY?.trim() ||
    process.env.PRIVATE_KEY?.trim();
  if (!k || !/^0x[a-fA-F0-9]{64}$/.test(k)) {
    console.error('Set DEPLOY_PRIVATE_KEY or PRIVATE_KEY (0x + 64 hex). Never commit keys.');
    process.exit(1);
  }
  return k;
}

async function main() {
  const privateKey = mustKey();
  const rpcUrl =
    process.env.RPC_URL?.trim() ||
    process.env.BASE_RPC_URL?.trim() ||
    'https://mainnet.base.org';
  const curveAddr =
    process.env.VITE_VILLA_BONDING_CURVE_ADDRESS?.trim() ||
    process.env.VILLA_POC_BONDING_CURVE?.trim();
  const beneficiary = process.env.VILLA_POC_BENEFICIARY?.trim();

  if (!curveAddr || !/^0x[a-fA-F0-9]{40}$/i.test(curveAddr)) {
    console.error('Set VITE_VILLA_BONDING_CURVE_ADDRESS or VILLA_POC_BONDING_CURVE.');
    process.exit(1);
  }
  if (!beneficiary || !/^0x[a-fA-F0-9]{40}$/i.test(beneficiary)) {
    console.error('Set VILLA_POC_BENEFICIARY.');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const abi = require('../artifacts/contracts/VillaPocBondingCurve.sol/VillaPocBondingCurve.json').abi;
  const curve = new ethers.Contract(curveAddr, abi, wallet);

  const paused = await curve.paused();
  if (paused) {
    const tx = await curve.setPaused(false);
    console.log('Unpausing contract – tx hash:', tx.hash);
    await tx.wait();
    console.log('Contract is now unpaused');
  } else {
    console.log('Contract already unpaused');
  }

  const currentBeneficiary = await curve.beneficiary();
  if (currentBeneficiary.toLowerCase() !== beneficiary.toLowerCase()) {
    const tx2 = await curve.setBeneficiary(beneficiary);
    console.log('Updating beneficiary – tx hash:', tx2.hash);
    await tx2.wait();
    console.log('Beneficiary set to', beneficiary);
  } else {
    console.log('Beneficiary already correct');
  }
}

main().catch(err => {
  console.error('❌ Execution error:', err);
  process.exit(1);
});
