/**
 * Deploy GovernanceDAO.sol only (e.g. after the one-vote-per-proposal fix).
 *
 *   npx hardhat run scripts/deploy-governance-dao.cjs --network baseSepolia
 *   npx hardhat run scripts/deploy-governance-dao.cjs --network base
 *
 * Add other networks in hardhat.config.cjs, then:
 *   npx hardhat run scripts/deploy-governance-dao.cjs --network arbitrumOne
 *
 * Optional env:
 *   GOVERNANCE_INITIAL_OWNER — defaults to deployer (must be able to setVotingPower / own contract).
 */
const hre = require("hardhat");

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

async function main() {
  const signers = await hre.ethers.getSigners();
  if (!signers.length) {
    console.error("Set DEPLOY_PRIVATE_KEY or PRIVATE_KEY in .env (0x + 64 hex).");
    process.exit(1);
  }
  const [deployer] = signers;
  const net = await hre.ethers.provider.getNetwork();
  const chainId = Number(net.chainId);
  const opts = await txOpts(chainId, 200);

  const ownerRaw = process.env.GOVERNANCE_INITIAL_OWNER?.trim();
  const initialOwner =
    ownerRaw && /^0x[a-fA-F0-9]{40}$/i.test(ownerRaw) ? hre.ethers.getAddress(ownerRaw) : deployer.address;

  console.log("Chain ID:", chainId);
  console.log("Deployer:", deployer.address);
  console.log("GovernanceDAO initialOwner:", initialOwner);

  const GovernanceDAO = await hre.ethers.getContractFactory("GovernanceDAO");
  const dao = await GovernanceDAO.deploy(initialOwner, opts);
  await dao.waitForDeployment();
  const daoAddr = await dao.getAddress();
  console.log("\nGovernanceDAO deployed:", daoAddr);

  if (initialOwner.toLowerCase() === deployer.address.toLowerCase()) {
    const w = hre.ethers.parseEther("1");
    await (await dao.setVotingPower(deployer.address, w, await txOpts(chainId, 220))).wait();
    console.log("Seeded deployer votingPower:", w.toString());
  } else {
    console.log("Owner is not deployer — call setVotingPower from the owner wallet after deploy.");
  }

  console.log("\n--- Update server .env (this stack is one CHAIN_ID + one DAO address) ---\n");
  console.log(`CHAIN_ID=${chainId}`);
  console.log(`DAO_CONTRACT=${daoAddr}`);
  console.log("\nIf you replaced an old DAO, update PROPOSAL_IDS to real proposal ids on this contract.");
  console.log("Multichain: run one API + UI deployment per chain, or see deploy/MULTICHAIN.md.\n");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
