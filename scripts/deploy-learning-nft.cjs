/**
 * Deploy LearningAchievement (soulbound learning NFTs).
 *
 * Base Sepolia: npx hardhat run scripts/deploy-learning-nft.cjs --network baseSepolia
 * Base mainnet: npx hardhat run scripts/deploy-learning-nft.cjs --network base
 */
const hre = require("hardhat");

/**
 * Default artwork for all achievement types (matches app `OSC_LEARNING_NFT_IMAGE_URL`).
 * Metadata is inline data: URIs so new deploys work without hosting JSON elsewhere.
 */
const NFT_IMAGE = "https://buildingculture.4everbucket.com/nft.png";

function metadataDataUri(name, description) {
  const payload = JSON.stringify({ name, description, image: NFT_IMAGE });
  return `data:application/json;charset=utf-8,${encodeURIComponent(payload)}`;
}

/** Achievement types 1–4: names + descriptions aligned with `src/data/learningRoutes.ts` + vault patron copy. */
const URIS = [
  metadataDataUri(
    "RWA Scholar",
    "Tokenized real estate vs paper friction — what is actually on-chain? Soulbound Onchain Savings Club Academy credential; educational use only.",
  ),
  metadataDataUri(
    "Authenticity Scout",
    "Sneakers, luxury, and certificates — when NFTs are proof vs promotion. Soulbound Onchain Savings Club Academy credential; educational use only.",
  ),
  metadataDataUri(
    "Truth Navigator",
    "What blockchains prove — and what still requires trusted data. Soulbound Onchain Savings Club Academy credential; educational use only.",
  ),
  metadataDataUri(
    "Vault Patron",
    "Soulbound credential for meeting the club vault patron threshold — thank you for backing the vault. Educational use only.",
  ),
];

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const net = await hre.ethers.provider.getNetwork();
  console.log("Deployer:", deployer.address);
  console.log("Chain ID:", Number(net.chainId));

  const Factory = await hre.ethers.getContractFactory("LearningAchievement");
  const nft = await Factory.deploy(
    deployer.address,
    "Onchain Savings Learning",
    "OSLEARN",
    URIS[0],
    URIS[1],
    URIS[2],
    URIS[3],
  );
  await nft.waitForDeployment();
  const addr = await nft.getAddress();
  console.log("LearningAchievement:", addr);
  console.log("\nAdd to .env:");
  console.log(`LEARNING_NFT_CONTRACT=${addr}`);
  /** OpenZeppelin AccessControl `MINTER_ROLE` — avoid `nft.MINTER_ROLE()` eth_call (some RPCs return empty right after deploy). */
  const minterRole = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));
  console.log("Grant MINTER_ROLE to server hot wallet if different from deployer:");
  console.log(`  cast send ${addr} "grantRole(bytes32,address)" ${minterRole} <SERVER_ADDRESS>`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
