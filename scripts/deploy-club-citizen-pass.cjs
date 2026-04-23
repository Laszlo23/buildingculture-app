/**
 * Deploy ClubCitizenPass (paid Citizen membership ERC-721).
 *
 * Env (optional overrides):
 *   CITIZEN_PASS_TREASURY — defaults to deployer (replace with ClubTreasury in production)
 *   CITIZEN_PRICE_WEI — default 0.00015 ether on Base Sepolia, 0.15 ether on Base mainnet
 *   CITIZEN_MAX_SUPPLY — default 25000
 *
 * Base Sepolia: npx hardhat run scripts/deploy-club-citizen-pass.cjs --network baseSepolia
 * Base mainnet: npx hardhat run scripts/deploy-club-citizen-pass.cjs --network base
 */

const NFT_IMAGE = "https://buildingculture.4everbucket.com/nft.png";

function metadataDataUri(name, description) {
  const payload = JSON.stringify({ name, description, image: NFT_IMAGE });
  return `data:application/json;charset=utf-8,${encodeURIComponent(payload)}`;
}

const CITIZEN_URI = metadataDataUri(
  "Onchain Savings Club — Citizen",
  "Citizen membership for the Onchain Savings Club. Educational and community access; not financial advice.",
);

async function main() {
  const { default: hre } = await import("hardhat");
  const { ethers } = await hre.network.create();

  const [deployer] = await ethers.getSigners();
  const net = await ethers.provider.getNetwork();
  const chainId = Number(net.chainId);
  console.log("Deployer:", deployer.address);
  console.log("Chain ID:", chainId);

  const treasury =
    process.env.CITIZEN_PASS_TREASURY?.trim() && ethers.isAddress(process.env.CITIZEN_PASS_TREASURY.trim())
      ? process.env.CITIZEN_PASS_TREASURY.trim()
      : deployer.address;

  let defaultPriceWei;
  if (process.env.CITIZEN_PRICE_WEI?.trim()) {
    defaultPriceWei = BigInt(process.env.CITIZEN_PRICE_WEI.trim());
  } else if (chainId === 84532) {
    defaultPriceWei = ethers.parseEther("0.00015");
  } else {
    defaultPriceWei = ethers.parseEther("0.15");
  }

  const maxSupply = process.env.CITIZEN_MAX_SUPPLY?.trim()
    ? BigInt(process.env.CITIZEN_MAX_SUPPLY.trim())
    : 25_000n;

  const Factory = await ethers.getContractFactory("ClubCitizenPass");
  const pass = await Factory.deploy(
    deployer.address,
    treasury,
    "Onchain Savings Citizen",
    "OSCITIZEN",
    CITIZEN_URI,
    defaultPriceWei,
    maxSupply,
  );
  await pass.waitForDeployment();
  const addr = await pass.getAddress();
  console.log("ClubCitizenPass:", addr);
  console.log("Treasury (withdraw target):", treasury);
  console.log("citizenPriceWei:", defaultPriceWei.toString());
  console.log("maxCitizenSupply:", maxSupply.toString());
  console.log("\nAdd to .env:");
  console.log(`MEMBERSHIP_NFT_CONTRACT=${addr}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
