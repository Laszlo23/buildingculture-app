require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

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
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
    },
    /** Base mainnet — use ALCHEMY_API_KEY, BASE_MAINNET_RPC_URL, or public fallback */
    base: {
      url:
        alchemyHttpUrl(8453) ||
        process.env.BASE_MAINNET_RPC_URL ||
        "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8453,
      gasMultiplier: 1.15,
    },
  },
};
