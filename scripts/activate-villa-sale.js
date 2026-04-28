// scripts/activate-villa-sale.js
// Hardhat script to ensure the Villa POC Bonding Curve is active (unpaused) and has the correct beneficiary.
// ---------------------------------------------------------------
// Prerequisites:
//   - .env contains PRIVATE_KEY, RPC_URL, VITE_VILLA_BONDING_CURVE_ADDRESS, VILLA_POC_BENEFICIARY
//   - Hardhat is configured (hardhat.config.ts) to use the Base RPC URL.
//   - Deployer address must own the contract (owner).

require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Using deployer:', deployer.address);

  const curveAddr = process.env.VITE_VILLA_BONDING_CURVE_ADDRESS;
  const beneficiary = process.env.VILLA_POC_BENEFICIARY;

  if (!curveAddr) throw new Error('VITE_VILLA_BONDING_CURVE_ADDRESS not set in .env');
  if (!beneficiary) throw new Error('VILLA_POC_BENEFICIARY not set in .env');

  const Curve = await ethers.getContractAt('VillaPocBondingCurve', curveAddr, deployer);

  // 1) Ensure contract is unpaused
  const paused = await Curve.paused();
  if (paused) {
    const txPause = await Curve.setPaused(false);
    console.log('Unpausing contract, tx:', txPause.hash);
    await txPause.wait();
    console.log('Contract is now unpaused');
  } else {
    console.log('Contract already unpaused');
  }

  // 2) Ensure correct beneficiary
  const currentBeneficiary = await Curve.beneficiary();
  if (currentBeneficiary.toLowerCase() !== beneficiary.toLowerCase()) {
    const txBenef = await Curve.setBeneficiary(beneficiary);
    console.log('Updating beneficiary, tx:', txBenef.hash);
    await txBenef.wait();
    console.log('Beneficiary updated to', beneficiary);
  } else {
    console.log('Beneficiary already set correctly');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
