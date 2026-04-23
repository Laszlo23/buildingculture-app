import "dotenv/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatEthersChaiMatchers from "@nomicfoundation/hardhat-ethers-chai-matchers";
import hardhatKeystore from "@nomicfoundation/hardhat-keystore";
import hardhatMocha from "@nomicfoundation/hardhat-mocha";
import hardhatNetworkHelpers from "@nomicfoundation/hardhat-network-helpers";
import { defineConfig } from "hardhat/config";

function deployerPrivateKeys(): string[] {
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
    return [];
  }
  return [pk];
}

function alchemyHttpUrl(chainId: number): string | null {
  const k = process.env.ALCHEMY_API_KEY?.trim();
  if (!k) return null;
  const host = chainId === 84532 ? "base-sepolia" : "base-mainnet";
  return `https://${host}.g.alchemy.com/v2/${k}`;
}

const deployKeys = deployerPrivateKeys();

export default defineConfig({
  plugins: [
    hardhatEthers,
    hardhatEthersChaiMatchers,
    hardhatKeystore,
    hardhatMocha,
    hardhatNetworkHelpers,
  ],
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
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
      chainId: 31337,
    },
    baseSepolia: {
      type: "http",
      chainType: "generic",
      chainId: 84532,
      url:
        alchemyHttpUrl(84532) ||
        process.env.RPC_URL?.trim() ||
        "https://sepolia.base.org",
      accounts: deployKeys.length ? deployKeys : "remote",
    },
    base: {
      type: "http",
      chainType: "generic",
      chainId: 8453,
      url:
        alchemyHttpUrl(8453) ||
        process.env.BASE_MAINNET_RPC_URL?.trim() ||
        "https://mainnet.base.org",
      accounts: deployKeys.length ? deployKeys : "remote",
      gasMultiplier: 1.15,
    },
    arbitrumOne: {
      type: "http",
      chainType: "generic",
      chainId: 42161,
      url: process.env.ARBITRUM_RPC_URL?.trim() || "https://arb1.arbitrum.io/rpc",
      accounts: deployKeys.length ? deployKeys : "remote",
    },
    optimism: {
      type: "http",
      chainType: "op",
      chainId: 10,
      url: process.env.OPTIMISM_RPC_URL?.trim() || "https://mainnet.optimism.io",
      accounts: deployKeys.length ? deployKeys : "remote",
    },
  },
});
