import { parseAbi } from "viem";

/** Minimal ERC-20 surface for USDC approve / allowance. */
export const erc20MinimalAbi = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
]);
