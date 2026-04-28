// scripts/activate-villa-sale.cjs
// CommonJS script to ensure the Villa POC Bonding Curve is active (unpaused) and has the correct beneficiary.
// ---------------------------------------------------------------
require('dotenv').config();
const { ethers } = require('ethers'); // directly use ethers (no hardhat needed)

async function main() {
  const rpcUrl = process.env.RPC_URL || "https://mainnet.base.org";
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error('PRIVATE_KEY not set in .env');

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const curveAddr = process.env.VITE_VILLA_BONDING_CURVE_ADDRESS;
  const beneficiary = process.env.VILLA_POC_BENEFICIARY;
  if (!curveAddr) throw new Error('VITE_VILLA_BONDING_CURVE_ADDRESS missing');
  if (!beneficiary) throw new Error('VILLA_POC_BENEFICIARY missing');

  // Load ABI from compiled artifact
  const abi = require('../artifacts/contracts/VillaPocBondingCurve.sol/VillaPocBondingCurve.json').abi;
  const curve = new ethers.Contract(curveAddr, abi, wallet);

  // 1) Unpause if needed
  const paused = await curve.paused();
  if (paused) {
    const tx = await curve.setPaused(false);
    console.log('Unpausing contract, tx hash:', tx.hash);
    await tx.wait();
    console.log('Contract unpaused');
  } else {
    console.log('Contract already unpaused');
  }

  // 2) Set correct beneficiary
  const currentBeneficiary = await curve.beneficiary();
  if (currentBeneficiary.toLowerCase() !== beneficiary.toLowerCase()) {
    const tx2 = await curve.setBeneficiary(beneficiary);
    console.log('Updating beneficiary, tx hash:', tx2.hash);
    await tx2.wait();
    console.log('Beneficiary set to', beneficiary);
  } else {
    console.log('Beneficiary already correct');
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
