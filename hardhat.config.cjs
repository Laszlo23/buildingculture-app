require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** Prefer a deploy-only key so Hardhat does not have to reuse the API signer wallet. */
function deployerPrivateKeys() {
  const raw = (
    process.env.DEPLOY_PRIVATE_KEY ||
    process.env.HARDHAT_PRIVATE_KEY ||
    process.env.PRIVATE_KEY ||
    ""
  ).trim();
  if (!raw) return [];
  const pk = raw.startsWith("0x") || raw.startsWith("0X") ? raw : `0x${raw}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(pk)) {
    console.warn(
      "[hardhat] Deploy key must be 32-byte hex (with or without 0x). Check DEPLOY_PRIVATE_KEY / PRIVATE_KEY.",
    );
  }
  return [pk];
}

function alchemyHttpUrl(chainId) {
  const k = process.env.ALCHEMY_API_KEY?.trim();
  if (!k) return null;
  const host = chainId === 84532 ? "base-sepolia" : "base-mainnet";
  return `https://${host}.g.alchemy.com/v2/${k}`;
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./contracts/test",
    cache: "./cache/hardhat",
    artifacts: "./artifacts",
  },
  networks: {
    hardhat: { chainId: 31337 },
    baseSepolia: {
      url: alchemyHttpUrl(84532) || process.env.RPC_URL || "https://sepolia.base.org",
      accounts: deployerPrivateKeys(),
      chainId: 84532,
    },
    /** Base mainnet — use ALCHEMY_API_KEY, BASE_MAINNET_RPC_URL, or public fallback */
    base: {
      url:
        alchemyHttpUrl(8453) ||
        process.env.BASE_MAINNET_RPC_URL ||
        "https://mainnet.base.org",
      accounts: deployerPrivateKeys(),
      chainId: 8453,
      gasMultiplier: 1.15,
    },
    /** Optional — set ARBITRUM_RPC_URL / OPTIMISM_RPC_URL for paid endpoints; `npm run deploy:dao -- --network arbitrumOne` */
    arbitrumOne: {
      url: process.env.ARBITRUM_RPC_URL?.trim() || "https://arb1.arbitrum.io/rpc",
      accounts: deployerPrivateKeys(),
      chainId: 42161,
    },
    optimism: {
      url: process.env.OPTIMISM_RPC_URL?.trim() || "https://mainnet.optimism.io",
      accounts: deployerPrivateKeys(),
      chainId: 10,
    },
  },
};
