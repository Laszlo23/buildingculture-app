/**
 * Deploy LearningAchievement (soulbound learning NFTs).
 *
 * Base Sepolia: npx hardhat run scripts/deploy-learning-nft.cjs --network baseSepolia
 * Base mainnet: npx hardhat run scripts/deploy-learning-nft.cjs --network base
 */
const hre = require("hardhat");

/** Placeholder metadata URIs per achievement type (1–4). Replace with real JSON (IPFS or HTTPS) before production. */
const URIS = [
  "https://example.com/osl/metadata/rwa-scholar.json",
  "https://example.com/osl/metadata/authenticity-scout.json",
  "https://example.com/osl/metadata/truth-navigator.json",
  "https://example.com/osl/metadata/vault-patron.json",
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
  const minter = await nft.MINTER_ROLE();
  console.log("Grant MINTER_ROLE to server hot wallet if different from deployer:");
  console.log(`  cast send ${addr} "grantRole(bytes32,address)" ${minter} <SERVER_ADDRESS>`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
